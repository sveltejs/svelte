import * as cookie from 'cookie';
import flru from 'flru';
import { find, query } from './db';

export const sanitize_user = obj => obj && ({
	uid: obj.uid,
	username: obj.username,
	name: obj.name,
	avatar: obj.avatar
});

const session_cache = flru(1000);

export const create_user = async (gh_user, access_token) => {
	return await find(`
		insert into users(uid, name, username, avatar, github_token)
		values ($1, $2, $3, $4, $5) on conflict (uid) do update
		set (name, username, avatar, github_token, updated_at) = ($2, $3, $4, $5, now())
		returning id, uid, username, name, avatar
	`, [gh_user.id, gh_user.name, gh_user.login, gh_user.avatar_url, access_token]);
};

export const create_session = async user => {
	const session = await find(`
		insert into sessions(user_id)
		values ($1)
		returning uid
	`, [user.id]);

	session_cache.set(session.uid, user);

	return session;
};

export const delete_session = async sid => {
	await query(`delete from sessions where uid = $1`, [sid]);
	session_cache.set(sid, null);
};

const get_user = async sid => {
	if (!sid) return null;

	if (!session_cache.has(sid)) {
		session_cache.set(sid, await find(`
			select users.id, users.uid, users.username, users.name, users.avatar
			from sessions
			left join users on sessions.user_id = users.id
			where sessions.uid = $1 and expiry > now()
		`, [sid]));
	}

	return session_cache.get(sid);
};

export const authenticate = () => {
	// this is a convenient time to clear out expired sessions
	query(`delete from sessions where expiry < now()`);

	return async (req, res, next) => {
		req.cookies = cookie.parse(req.headers.cookie || '');
		req.user = await get_user(req.cookies.sid);

		next();
	};
};