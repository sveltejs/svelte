import * as cookie from 'cookie';
import flru from 'flru';
import { client } from './client.js';

const session_cache = flru(1000);

/** @typedef {import('./types').User} User */

/**
 * @param {User} user
 * @param {string} access_token
 */
export async function create(user, access_token) {
	const { data, error } = await client.rpc('login', {
		user_github_id: user.github_id,
		user_github_name: user.github_name,
		user_github_login: user.github_login,
		user_github_avatar_url: user.github_avatar_url
	});

	if (error) {
		throw new Error(error.message);
	}

	session_cache.set(data.sessionid, {
		id: data.userid,
		github_name: user.github_name,
		github_login: user.github_login,
		github_avatar_url: user.github_avatar_url
	});

	return {
		sessionid: data.sessionid,
		expires: new Date(data.expires)
	};
}

/**
 * @param {string} sessionid
 * @returns {Promise<User>}
 */
export async function read(sessionid) {
	if (!sessionid) return null;

	if (!session_cache.get(sessionid)) {
		session_cache.set(
			sessionid,
			client
				.rpc('get_user', { sessionid })
				.then(({ data, error }) => {
					if (error) {
						throw new Error(error.message);
					}

					return data.id && data;
				})
				.catch(() => {
					session_cache.set(sessionid, null);
				})
		);
	}

	return await session_cache.get(sessionid);
}

/** @param {string} sessionid */
export async function destroy(sessionid) {
	const { error } = await client.rpc('logout', { sessionid });

	if (error) {
		throw new Error(error.message);
	}

	session_cache.set(sessionid, null);
}

/** @type {string | null} str */
export function from_cookie(str) {
	if (!str) return null;
	return read(cookie.parse(str).sid);
}
