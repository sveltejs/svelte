import { get_example } from './_examples.js';

const cache = new Map();

export function get(req, res) {
	const { slug } = req.params;

	try {
		if (!cache.has(slug) || process.env.NODE_ENV !== 'production') {
			cache.set(slug, JSON.stringify(get_example(slug)));
		}

		res.writeHead(200, {
			'Content-Type': 'application/json'
		});

		res.end(cache.get(slug));
	} catch (err) {
		res.writeHead(404, {
			'Content-Type': 'application/json'
		});

		res.end(JSON.stringify({ error: 'not found' }));
	}
}
