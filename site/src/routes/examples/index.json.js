import { get_examples } from './_examples.js';

let cached;

export function get(req, res) {
	try {
		if (!cached || process.env.NODE_ENV !== 'production') {
			cached = JSON.stringify(get_examples());
		}

		res.writeHead(200, {
			'Content-Type': 'application/json'
		});

		res.end(cached);
	} catch (e) {
		res.writeHead(e.status || 500, {
			'Content-Type': 'application/json'
		});

		res.end(JSON.stringify({ message: e.message }));
	}
}