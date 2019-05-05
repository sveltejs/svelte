import send from '@polka/send';
import { isUser, toUser } from '../../backend/auth';

export async function get(req, res) {
	const user = await isUser(req, res);
	res.setHeader('Cache-Control', 'private, no-cache, no-store');
	return send(res, 200, user ? toUser(user) : null);
}
