import * as httpie from 'httpie';
import { query, find } from '../../../utils/db';
import { get_example } from '../../examples/_examples.js';

const GITHUB_CLIENT_ID = process.env['GITHUB_CLIENT_ID'];
const GITHUB_CLIENT_SECRET = process.env['GITHUB_CLIENT_SECRET'];

export async function get({ path, params }) {
	// is this an example?
	const example = get_example(params.id);

	if (example) {
		return {
			body: {
				relaxed: true,
				uid: params.id,
				name: example.title,
				files: example.files,
				owner: null
			}
		};
	}

	if (process.env.NODE_ENV === 'development') {
		// In dev, proxy requests to load particular REPLs to the real server.
		// This avoids needing to connect to the real database server.
		try {
			const res_proxy = await httpie.get(`https://svelte.dev${path}`);
			return {
				body: res_proxy.data,
				status: res_proxy.statusCode,
				headers: res_proxy.headers
			};
		} catch (err) {
			return {
				status: err.statusCode,
				body: { error: err.message }
			};
		}
	}

	const [row] = await query(`
		select g.*, u.uid as owner from gists g
		left join users u on g.user_id = u.id
		where g.uid = $1 limit 1
	`, [params.id]); // via filename pattern

	if (!row) {
		const base = `https://api.github.com/gists/${params.id}`;
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

				user = await find(`
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
				values ($1, $2, $3, $4)
			`, [params.id, user.id, data.description, JSON.stringify(files)]);

			return {
				body: {
					uid: params.id,
					name: data.description,
					files,
					owner: data.owner.id
				}
			};
		} catch (err) {
			return {
				status: err.statusCode,
				body: { error: err.message }
			};
		}
	}

	return {
		body: {
			uid: row.uid.replace(/-/g, ''),
			name: row.name,
			files: row.files,
			owner: row.owner
		}
	};
}

export async function patch({ params, locals, body }) {
	const { user } = locals;
	if (!user) return;

	let id;
	const uid = params.id;

	try {
		const [row] = await query(`select * from gists where uid = $1 limit 1`, [uid]);
		if (!row) {
			return {
				status: 404,
				body: {
					error: 'Gist not found'
				}
			};
		}
		if (row.user_id !== user.id) {
			return { status: 403, body: { error: 'Item does not belong to you' }};
		}
		id = row.id;
	} catch (err) {
		console.error('PATCH /gists @ select', err);
		return { status: 500 };
	}

	try {
		const obj = body;
		obj.updated_at = 'now()';
		let k;
		const cols = [];
		const vals = [];
		for (k in obj) {
			cols.push(k);
			vals.push(k === 'files' ? JSON.stringify(obj[k]) : obj[k]);
		}

		const tmp = vals.map((x, i) => `$${i + 1}`).join(',');
		const set = `set (${cols.join(',')}) = (${tmp})`;

		const [row] = await query(`update gists ${set} where id = ${id} returning *`, vals);

		return {
			body: {
				uid: row.uid.replace(/-/g, ''),
				name: row.name,
				files: row.files,
				owner: user.uid,
			}
		};
	} catch (err) {
		console.error('PATCH /gists @ update', err);
		return {
			status: 500,
			body: { error: err.message }
		};
	}
}
