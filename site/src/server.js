import sirv from 'sirv';
import * as sapper from '@sapper/server';
import { API } from './backend/auth';

const { PORT=3000 } = process.env;

API()
	.use(
		sirv('static', {
			setHeaders(res) {
				res.setHeader('Access-Control-Allow-Origin', '*');
				res.hasHeader('Cache-Control') || res.setHeader('Cache-Control', 'max-age=600'); // 10min default
			}
		}),

		sapper.middleware({
			// TODO update Sapper so that we can pass props to the client
			props: req => {
				const user = req.user;

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
	)
	.listen(PORT);
