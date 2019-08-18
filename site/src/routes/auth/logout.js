import send from '@polka/send';
import * as cookie from 'cookie';
import { query } from '../../utils/db.js';
import { secure } from './_config.js';

export async function get(req, res) {
	await query(`
		delete from sessions where uid = $1
	`, [req.cookies.sid]);

	send(res, 200, '', {
		'Set-Cookie': cookie.serialize('sid', '', {
			maxAge: -1,
			path: '/',
			httpOnly: true,
			secure
		})
	});
}