import send from '@polka/send';
import { query } from '../../utils/db';
import { isUser } from '../../backend/auth';

const {
	BASEURL,
} = process.env;

export async function get(req, res) {
	const user = await isUser(req, res);
	if (!user) return; // response already sent

	const offset = req.query.offset || 0;
	const rows = await query(`
		select
			g.uid,
			g.name,
			coalesce(g.updated_at, g.created_at) as updated_at,
			g.created_at
		from gists g
		where g.user_id = $1
		order by coalesce(g.updated_at, g.created_at) desc
		limit 20
		offset $2
	`, [user.id, offset]);

	send(res, 200, rows.map((row) => {
		return {
			url: `${BASEURL}/repl/${row.uid}`,
			...row,
		}
	}));
}
