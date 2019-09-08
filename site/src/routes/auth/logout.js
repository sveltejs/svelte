import send from '@polka/send';
import * as cookie from 'cookie';
import { secure } from './_config.js';
import { delete_session } from '../../utils/auth.js';

export async function get(req, res) {
	await delete_session(req.cookies.sid);

	send(res, 200, '', {
		'Set-Cookie': cookie.serialize('sid', '', {
			maxAge: -1,
			path: '/',
			httpOnly: true,
			secure
		})
	});
}