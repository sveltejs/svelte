import { query } from '../../utils/db';

export async function post({ locals, body }) {
	const { user } = locals;
	if (!user) return; // response already sent

	try {
		const { name, files } = body;

		const [row] = await query(`
			insert into gists(user_id, name, files)
			values ($1, $2, $3) returning *`, [user.id, name, JSON.stringify(files)]);

		return {
			status: 201,
			body: {
				uid: row.uid.replace(/-/g, ''),
				name: row.name,
				files: row.files,
				owner: user.uid,
			}
		};
	} catch (err) {
		return {
			status: 500,
			body: {
				error: err.message
			}
		};
	}
}
