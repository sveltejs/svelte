import polka from 'polka';
import send from '@polka/send';
import devalue from 'devalue';
import { get, post } from 'httpie';
import sirv from 'sirv';
import * as sapper from '@sapper/server';
import * as cookie from 'cookie';
import { parse, stringify } from 'querystring';
import { find, query } from './utils/db';

const {
	PORT = 3000,
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
	BASEURL
} = process.env;

const OAuth = 'https://github.com/login/oauth';

const app = polka({
	onError: (err, req, res) => {
		const error = err.message || err;
		const code = err.code || err.status || 500;
		res.headersSent || send(res, code, { error });
	}
});

const to_user = obj => ({
	uid: obj.uid,
	username: obj.username,
	name: obj.name,
	avatar: obj.avatar
});

if (GITHUB_CLIENT_ID) {
	app.use(async (req, res, next) => {
		if (req.headers.cookie) {
			const cookies = cookie.parse(req.headers.cookie);
			if (cookies.sid) {
				if (req.url === '/auth/logout') {
					await query(`
						delete from sessions where uid = $1
					`, [cookies.sid]);
					send(res, 200);
					return;
				}

				req.user = await find(`
					select users.id, users.uid, users.username, users.name, users.avatar
					from sessions
					left join users on sessions.user_id = users.id
					where sessions.uid = $1 and expiry > now()
				`, [cookies.sid]);
			}
		}

		next();
	});

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

			const cookie = [
				`sid=${session.uid}`,
				`Max-Age=31536000`,
				`Path=/`,
				`HttpOnly`
			];

			res.writeHead(200, {
				'Set-Cookie': cookie.join('; '),
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

app.use(
	sirv('static', {
		dev: process.env.NODE_ENV === 'development',
		setHeaders(res) {
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.hasHeader('Cache-Control') || res.setHeader('Cache-Control', 'max-age=600'); // 10min default
		}
	}),

	sapper.middleware({
		session: req => ({
			user: to_user(req.user)
		})
	})
);

app.listen(PORT);