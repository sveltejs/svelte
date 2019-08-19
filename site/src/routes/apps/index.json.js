import send from '@polka/send';
import { query } from '../../utils/db';

export async function get(req, res) {
	if (req.user) {
		const page_size = 100;
		const offset = req.query.offset ? parseInt(req.query.offset) : 0;
		const rows = await query(`
			select g.uid, g.name, coalesce(g.updated_at, g.created_at) as updated_at
			from gists g
			where g.user_id = $1
			order by id desc
			limit ${page_size + 1}
			offset $2
		`, [req.user.id, offset]);

		rows.forEach(row => {
			row.uid = row.uid.replace(/-/g, '');
		});

		const more = rows.length > page_size;
		send(res, 200, { apps: rows.slice(0, page_size), offset: more ? offset + page_size : null });
	} else {
		send(res, 401);
	}
}
