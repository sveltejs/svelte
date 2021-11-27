import { query as db_query } from '../../utils/db';

export async function get({ query, locals }) {
	if (locals.user) {
		const page_size = 100;
		const offset = query.get('offset') ? parseInt(query.get('offset')) : 0;
		const rows = await db_query(`
			select g.uid, g.name, coalesce(g.updated_at, g.created_at) as updated_at
			from gists g
			where g.user_id = $1
			order by id desc
			limit ${page_size + 1}
			offset $2
		`, [locals.user.id, offset]);

		rows.forEach(row => {
			row.uid = row.uid.replace(/-/g, '');
		});

		const more = rows.length > page_size;
		return { body: { apps: rows.slice(0, page_size), offset: more ? offset + page_size : null }};
	} else {
		return { status: 401 };
	}
}
