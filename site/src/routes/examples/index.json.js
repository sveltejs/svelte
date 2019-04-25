import send from '@polka/send';
import { get_examples } from './_examples.js';

let cached;

export function get(req, res) {
	try {
		if (!cached || process.env.NODE_ENV !== 'production') {
			cached = get_examples().filter(section => section.title);
		}

		send(res, 200, cached);
	} catch (e) {
		send(res, e.status || 500, {
			message: e.message
		});
	}
}
