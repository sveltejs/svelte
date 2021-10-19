import * as cookie from 'cookie';
import { secure } from './_config.js';
import { delete_session } from '../../utils/auth.js';

export async function get(request) {
	await delete_session(request.locals.cookies.sid);

	return {
		headers: {
			'Set-Cookie': cookie.serialize('sid', '', {
				maxAge: -1,
				path: '/',
				httpOnly: true,
				secure
			})	
		}
	};
}
