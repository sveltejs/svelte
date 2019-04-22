import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy } from 'passport-github';
import sessionFileStore from 'session-file-store';
import serve from 'serve-static';
import devalue from 'devalue';
import * as sapper from '@sapper/server';

const app = express();

if (process.env.GITHUB_CLIENT_ID) {
	const FileStore = sessionFileStore(session);

	passport.use(new Strategy({
		clientID: process.env.GITHUB_CLIENT_ID,
		clientSecret: process.env.GITHUB_CLIENT_SECRET,
		callbackURL: `${process.env.BASEURL}/auth/callback`,
		userAgent: 'svelte.dev'
	}, (accessToken, refreshToken, profile, callback) => {
		return callback(null, {
			token: accessToken,
			id: profile.id,
			username: profile.username,
			displayName: profile.displayName,
			photo: profile.photos && profile.photos[0] && profile.photos[0].value
		});
	}));

	passport.serializeUser((user, cb) => {
		cb(null, user);
	});

	passport.deserializeUser((obj, cb) => {
		cb(null, obj);
	});

	app
		.use(session({
			secret: 'svelte',
			resave: true,
			saveUninitialized: true,
			cookie: {
				maxAge: 31536000
			},
			store: new FileStore({
				path: process.env.NOW ? `/tmp/sessions` : `.sessions`
			})
		}))

		.use(passport.initialize())
		.use(passport.session())

		.get('/auth/login', (req, res, next) => {
			const { returnTo } = req.query;
			req.session.returnTo = returnTo ? decodeURIComponent(returnTo) : '/';
			next();
		}, passport.authenticate('github', { scope: ['gist', 'read:user'] }))

		.post('/auth/logout', (req, res) => {
			req.logout();
			res.end('ok');
		})

		.get('/auth/callback', passport.authenticate('github', { failureRedirect: '/auth/error' }), (req, res) => {
			const { id, username, displayName, photo } = req.session.passport && req.session.passport.user;

			res.set({ 'Content-Type': 'text/html; charset=utf-8' });
			res.end(`
				<script>
					window.opener.postMessage({
						user: ${devalue({ id, username, displayName, photo })}
					}, window.location.origin);
				</script>
			`);
		});
} else {
	app.get('/auth/login', (req, res) => {
		res.writeHead(500);
		res.end(`
			<body style="font-family: sans-serif; background: rgb(255,215,215); border: 2px solid red; margin: 0; padding: 1em;">
				<h1>Missing .env file</h1>
				<p>In order to use GitHub authentication, you will need to <a target="_blank" href="https://github.com/settings/developers">register an OAuth application</a> with <code>gist</code> and <code>read:user</code> scopes, and create a .env file:</p>

				<pre>GITHUB_CLIENT_ID=[YOUR_APP_ID]\nGITHUB_CLIENT_SECRET=[YOUR_APP_SECRET]\nBASEURL=http://localhost:3000</pre>

				<p>The <code>BASEURL</code> variable should match the callback URL specified for your app.</p>
			</body>
		`);
	});
}

app.use(
	serve('static', { setHeaders: res => res.setHeader('Access-Control-Allow-Origin', '*') }),
	sapper.middleware({
		// TODO update Sapper so that we can pass props to the client
		props: req => {
			const user = req.session && req.session.passport && req.session.passport.user;

			return {
				user: user && {
					// strip access token
					id: user.id,
					username: user.username,
					displayName: user.displayName,
					photo: user.photo
				}
			};
		}
	})
).listen(process.env.PORT);
