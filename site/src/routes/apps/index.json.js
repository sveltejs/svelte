import send from '@polka/send';
import { query } from '../../utils/db';

export async function get(req, res) {
	if (req.user) {
		const offset = req.query.offset || 0;
		const rows = await query(`
			select g.uid, g.name, coalesce(g.updated_at, g.created_at) as updated_at
			from gists g
			where g.user_id = $1
			order by updated_at desc
			limit 100
			offset $2
		`, [req.user.id, offset]);

		rows.forEach(row => {
			row.uid = row.uid.replace(/-/g, '');
		});

		send(res, 200, rows);
	} else {
		send(res, 401);
	}
}
