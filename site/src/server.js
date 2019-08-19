import polka from 'polka';
import send from '@polka/send';
import sirv from 'sirv';
import * as sapper from '@sapper/server';
import { sanitize_user, authenticate } from './utils/auth';

const { PORT = 3000 } = process.env;

const app = polka({
	onError: (err, req, res) => {
		const error = err.message || err;
		const code = err.code || err.status || 500;
		res.headersSent || send(res, code, { error });
	}
});

app.use(
	authenticate(),

	sirv('static', {
		dev: process.env.NODE_ENV === 'development',
		setHeaders(res) {
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.hasHeader('Cache-Control') || res.setHeader('Cache-Control', 'max-age=600'); // 10min default
		}
	}),

	sapper.middleware({
		session: req => ({
			user: sanitize_user(req.user)
		})
	})
);

app.listen(PORT);