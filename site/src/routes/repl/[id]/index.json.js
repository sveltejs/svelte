import send from '@polka/send';
import body from '../_utils/body.js';
import * as httpie from 'httpie';
import { query, find } from '../../../utils/db';
import { get_example } from '../../examples/_examples.js';

const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;

async function import_gist(req, res) {
	const base = `https://api.github.com/gists/${req.params.id}`;
	const url = `${base}?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}`;

	try {
		const { data } = await httpie.get(url, {
			headers: {
				'User-Agent': 'https://svelte.dev'
			}
		});

		// create owner if necessary...
		let user = await find(`select * from users where uid = $1`, [data.owner.id]);

		if (!user) {
			const { id, name, login, avatar_url } = data.owner;

			[user] = await query(`
				insert into users(uid, name, username, avatar)
				values ($1, $2, $3, $4)
				returning *
			`, [id, name, login, avatar_url]);
		}

		delete data.files['README.md'];
		delete data.files['meta.json'];

		const files = Object.keys(data.files).map(key => {
			const name = key.replace(/\.html$/, '.svelte');

			return {
				name,
				source: data.files[key].content
			};
		});

		// add gist to database...
		await query(`
			insert into gists(uid, user_id, name, files)
			values ($1, $2, $3, $4) returning *`, [req.params.id, user.id, data.description, JSON.stringify(files)]);

		send(res, 200, {
			uid: req.params.id,
			name: data.description,
			files,
			owner: data.owner.id
		});
	} catch (err) {
		send(res, err.statusCode, { error: err.message });
	}
}

export async function get(req, res) {
	// is this an example?
	const example = get_example(req.params.id);

	if (example) {
		return send(res, 200, {
			relaxed: true,
			uid: req.params.id,
			name: example.title,
			files: example.files,
			owner: null
		});
	}

	const [row] = await query(`
		select g.*, u.uid as owner from gists g
		left join users u on g.user_id = u.id
		where g.uid = $1 limit 1
	`, [req.params.id]); // via filename pattern

	if (!row) {
		return import_gist(req, res);
	}

	send(res, 200, {
		uid: row.uid.replace(/-/g, ''),
		name: row.name,
		files: row.files,
		owner: row.owner
	});
}

export async function patch(req, res) {
	const { user } = req;
	if (!user) return;

	let id, uid = req.params.id;

	try {
		const [row] = await query(`select * from gists where uid = $1 limit 1`, [uid]);
		if (!row) return send(res, 404, { error: 'Gist not found' });
		if (row.user_id !== user.id) return send(res, 403, { error: 'Item does not belong to you' });
		id = row.id;
	} catch (err) {
		console.error('PATCH /gists @ select', err);
		return send(res, 500);
	}

	try {
		const obj = await body(req);
		obj.updated_at = 'now()';
		let k, cols=[], vals=[];
		for (k in obj) {
			cols.push(k);
			vals.push(k === 'files' ? JSON.stringify(obj[k]) : obj[k]);
		}

		const tmp = vals.map((x, i) => `$${i + 1}`).join(',');
		const set = `set (${cols.join(',')}) = (${tmp})`;

		const [row] = await query(`update gists ${set} where id = ${id} returning *`, vals);

		send(res, 200, {
			uid: row.uid.replace(/-/g, ''),
			name: row.name,
			files: row.files,
			owner: user.uid,
		});
	} catch (err) {
		console.error('PATCH /gists @ update', err);
		send(res, 500, { error: err.message });
	}
}
