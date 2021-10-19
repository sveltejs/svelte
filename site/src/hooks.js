// need to do this first before importing database, etc.
import dotenv from 'dotenv';
dotenv.config();

import * as cookie from 'cookie';
import { get_user, sanitize_user } from './utils/auth';
import { query } from './utils/db';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ request, resolve }) {
	if (process.env['PGHOST']) {
		// this is a convenient time to clear out expired sessions
		query('delete from sessions where expiry < now()');

		request.locals.cookies = cookie.parse(request.headers.cookie || '');
		request.locals.user = await get_user(request.locals.cookies.sid);
	}

	const response = await resolve(request);

	return response;
}

/** @type {import('@sveltejs/kit').GetSession} */
export function getSession(request) {
	return request.locals.user
		? {
			user: sanitize_user(request.locals.user)
		}
		: {};
}
