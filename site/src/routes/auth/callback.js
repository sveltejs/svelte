import send from '@polka/send';
import devalue from 'devalue';
import * as cookie from 'cookie';
import * as httpie from 'httpie';
import { parse, stringify } from 'querystring';
import { find, query } from '../../utils/db.js';
import { to_user } from '../../utils/auth';
import { oauth, secure, client_id, client_secret } from './_config.js';

export async function get(req, res) {
	try {
		// Trade "code" for "access_token"
		const r1 = await httpie.post(`${oauth}/access_token?` + stringify({
			code: req.query.code,
			client_id,
			client_secret,
		}));

		// Now fetch User details
		const { access_token } = parse(r1.data);
		const r2 = await httpie.get('https://api.github.com/user', {
			headers: {
				'User-Agent': 'svelte.dev',
				Authorization: `token ${access_token}`
			}
		});

		const { id: uid, name, avatar_url, login } = r2.data;

		// Upsert `users` table
		const [user] = await query(`
			insert into users(uid, name, username, avatar, github_token)
			values ($1, $2, $3, $4, $5) on conflict (uid) do update
			set (name, username, avatar, github_token, updated_at) = ($2, $3, $4, $5, now())
			returning *
		`, [uid, name, login, avatar_url, access_token]);

		const session = await find(`
			insert into sessions(user_id)
			values ($1)
			returning *
		`, [user.id]);

		res.writeHead(200, {
			'Set-Cookie': cookie.serialize('sid', session.uid, {
				maxAge: 31536000,
				path: '/',
				httpOnly: true,
				secure
			}),
			'Content-Type': 'text/html; charset=utf-8'
		});

		res.end(`
			<script>
				window.opener.postMessage({
					user: ${devalue(to_user(user))}
				}, window.location.origin);
			</script>
		`);
	} catch (err) {
		console.error('GET /auth/callback', err);
		send(res, 500, err.data, {
			'Content-Type': err.headers['content-type'],
			'Content-Length': err.headers['content-length']
		});
	}
}