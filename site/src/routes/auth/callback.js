import send from '@polka/send';
import devalue from 'devalue';
import * as cookie from 'cookie';
import * as httpie from 'httpie';
import { parse, stringify } from 'querystring';
import { sanitize_user, create_user, create_session } from '../../utils/auth';
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

		const user = await create_user(r2.data, access_token);
		const session = await create_session(user);

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
					user: ${devalue(sanitize_user(user))}
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