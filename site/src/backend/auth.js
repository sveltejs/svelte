import polka from 'polka';
import devalue from 'devalue';
import send from '@polka/send';
import { get, post } from 'httpie';
import { parse, stringify } from 'querystring';
import { decode, sign, verify } from './token';
import { find, query } from '../utils/db';

const {
	BASEURL,
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
} = process.env;

const OAuth = 'https://github.com/login/oauth';

function exit(res, code, msg='') {
	const error = msg.charAt(0).toUpperCase() + msg.substring(1);
	send(res, code, { error });
}

function onError(err, req, res) {
	const error = err.message || err;
	const code = err.code || err.status || 500;
	res.headersSent || send(res, code, { error });
}

/**
 * Middleware to determine User validity
 */
export async function isUser(req, res) {
	const abort = exit.bind(null, res, 401);

	const auth = req.headers.authorization;
	if (!auth) return abort('Missing Authorization header');

	const [scheme, token] = auth.split(' ');
	if (scheme !== 'Bearer' || !token) return abort('Invalid Authorization format');

	let data;
	const decoded = decode(token, { complete:true });
	if (!decoded || !decoded.header) return abort('Invalid token');

	try {
		data = await verify(token);
	} catch (err) {
		return abort(err.message);
	}

	const { uid, username } = data;
	if (!uid || !username) return abort('Invalid token payload');

	try {
		const row = await find(`select * from users where uid = $1 and username = $2 limit 1`, [uid, username]);
		return row || abort('Invalid token');
	} catch (err) {
		console.error('Auth.isUser', err);
		return send(res, 500, 'Unknown error occurred');
	}
}

export function toUser(obj={}) {
	const { uid, username, name, avatar } = obj;
	const token = sign({ uid, username });
	return { uid, username, name, avatar, token };
}

export function API() {
	const app = polka({ onError });

	if (GITHUB_CLIENT_ID) {
		app.get('/auth/login', (req, res) => {
			try {
				const Location = `${OAuth}/authorize?` + stringify({
					scope: 'read:user',
					client_id: GITHUB_CLIENT_ID,
					redirect_uri: `${BASEURL}/auth/callback`,
				});

				send(res, 302, Location, { Location });
			} catch (err) {
				console.error('GET /auth/login', err);
				send(res, 500);
			}
		});

		app.get('/auth/callback', async (req, res) => {
			try {
				// Trade "code" for "access_token"
				const r1 = await post(`${OAuth}/access_token?` + stringify({
					code: req.query.code,
					client_id: GITHUB_CLIENT_ID,
					client_secret: GITHUB_CLIENT_SECRET,
				}));

				// Now fetch User details
				const { access_token } = parse(r1.data);
				const r2 = await get('https://api.github.com/user', {
					headers: {
						'User-Agent': 'svelte.dev',
						Authorization: `token ${access_token}`
					}
				});

				const { id, name, avatar_url, login } = r2.data;

				// Upsert `users` table
				const [user] = await query(`
					insert into users(uid, name, username, avatar, github_token)
					values ($1, $2, $3, $4, $5) on conflict (uid) do update
					set (name, username, avatar, github_token, updated_at) = ($2, $3, $4, $5, now())
					returning *
				`, [id, name, login, avatar_url, access_token]);

				send(res, 200, `
					<script>
						window.opener.postMessage({
							user: ${devalue(toUser(user))}
						}, window.location.origin);
					</script>
				`, {
					'Content-Type': 'text/html; charset=utf-8'
				});
			} catch (err) {
				console.error('GET /auth/callback', err);
				send(res, 500, err.data, {
					'Content-Type': err.headers['content-type'],
					'Content-Length': err.headers['content-length']
				});
			}
		});
	} else {
		// Print "Misconfigured" error
		app.get('/auth/login', (req, res) => {
			send(res, 500, `
				<body style="font-family: sans-serif; background: rgb(255,215,215); border: 2px solid red; margin: 0; padding: 1em;">
					<h1>Missing .env file</h1>
					<p>In order to use GitHub authentication, you will need to <a target="_blank" href="https://github.com/settings/developers">register an OAuth application</a> and create a local .env file:</p>
					<pre>GITHUB_CLIENT_ID=[YOUR_APP_ID]\nGITHUB_CLIENT_SECRET=[YOUR_APP_SECRET]\nBASEURL=http://localhost:3000</pre>
					<p>The <code>BASEURL</code> variable should match the callback URL specified for your app.</p>
					<p>See also <a target="_blank" href="https://github.com/sveltejs/svelte/tree/master/site#repl-github-integration">here</a></p>
				</body>
			`, {
				'Content-Type': 'text/html; charset=utf-8'
			});
		});
	}

	return app;
}
