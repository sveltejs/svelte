import send from '@polka/send';
import { query } from '../../utils/db';
import { isUser } from '../../backend/auth';
import { body } from './_utils.js';

export async function post(req, res) {
	const user = await isUser(req, res);
	if (!user) return; // response already sent

	try {
		const { name, components } = await body(req);

		const files = {};
		components.forEach(component => {
			const text = component.source.trim();
			if (!text.length) return; // skip empty file
			files[`${component.name}.${component.type}`] = text;
		});

		const [row] = await query(`
			insert into gists(user_id, name, files)
			values ($1, $2, $3) returning *`, [user.id, name, files]);

		send(res, 201, {
			uid: row.uid,
			name: row.name,
			files: row.files,
		});
	} catch (err) {
		send(res, 500, {
			error: err.message
		});
	}
}
