import sirv from 'sirv';
import * as sapper from '@sapper/server';
import { API } from './backend/auth';

const { PORT = 3000 } = process.env;

API()
	.use(
		sirv('static', {
			dev: process.env.NODE_ENV === 'development',
			setHeaders(res) {
				res.setHeader('Access-Control-Allow-Origin', '*');
				res.hasHeader('Cache-Control') || res.setHeader('Cache-Control', 'max-age=600'); // 10min default
			}
		}),

		sapper.middleware({
			//
		})
	)
	.listen(PORT);