import send from '@polka/send';
import { body } from './_utils.js';
import { query } from '../../utils/db';
import { isUser } from '../../backend/auth';

export async function get(req, res) {
	const [row] = await query(`
		select g.*, u.uid as owner from gists g
		left join users u on g.user_id = u.id
		where g.uid = $1 limit 1
	`, [req.params.id]); // via filename pattern

	if (!row) {
		return send(res, 404, { error: 'Gist not found' });
	}

	send(res, 200, {
		uid: row.uid,
		name: row.name,
		files: row.files,
		owner: row.owner
	});
}

export async function patch(req, res) {
	const user = await isUser(req, res);
	if (!user) return; // response already sent

	let id, uid=req.params.id;

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
			vals.push(obj[k]);
		}

		const tmp = vals.map((x, i) => `$${i + 1}`).join(',');
		const set = `set (${cols.join(',')}) = (${tmp})`;

		const [row] = await query(`update gists ${set} where id = ${id} returning *`, vals);

		send(res, 200, {
			uid: row.uid,
			name: row.name,
			files: row.files,
			owner: user.uid,
		});
	} catch (err) {
		console.error('PATCH /gists @ update', err);
		send(res, 500, { error: err.message });
	}
}
