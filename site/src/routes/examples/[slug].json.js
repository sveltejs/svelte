import send from '@polka/send';
import { get_example } from './_examples.js';

const cache = new Map();

export function get(req, res) {
	const { slug } = req.params;

	try {
		let example = cache.get(slug);

		if (!example || process.env.NODE_ENV !== 'production') {
			example = get_example(slug);
			cache.set(slug, example);
		}

		send(res, 200, example);
	} catch (err) {
		send(res, 404, {
			error: 'not found'
		});
	}
}
