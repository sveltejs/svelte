import polka from 'polka';
import send from '@polka/send';
import sirv from 'sirv';
import * as sapper from '@sapper/server';
import * as cookie from 'cookie';
import { find } from './utils/db';
import { to_user } from './utils/auth';

const { PORT = 3000 } = process.env;

const app = polka({
	onError: (err, req, res) => {
		const error = err.message || err;
		const code = err.code || err.status || 500;
		res.headersSent || send(res, code, { error });
	}
});

app.use(
	// authenticate user
	async (req, res, next) => {
		if (req.headers.cookie) {
			req.cookies = cookie.parse(req.headers.cookie);
			if (req.cookies.sid) {
				req.user = await find(`
					select users.id, users.uid, users.username, users.name, users.avatar
					from sessions
					left join users on sessions.user_id = users.id
					where sessions.uid = $1 and expiry > now()
				`, [req.cookies.sid]);
			}
		}

		next();
	},

	// serve static files
	sirv('static', {
		dev: process.env.NODE_ENV === 'development',
		setHeaders(res) {
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.hasHeader('Cache-Control') || res.setHeader('Cache-Control', 'max-age=600'); // 10min default
		}
	}),

	// run Sapper
	sapper.middleware({
		session: req => ({
			user: to_user(req.user)
		})
	})
);

app.listen(PORT);