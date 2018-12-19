import { demos } from '../_sections.js';

export function get(req, res) {
	const { hash } = req.params;

	if (!demos.has(hash)) {
		res.writeHead(404, {
			'Content-Type': 'application/json'
		});

		res.end(JSON.stringify({
			error: 'not found'
		}));
	} else {
		const json = demos.get(hash);
		res.writeHead(200, {
			'Content-Type': 'application/json'
		});

		res.end(json);
	}
}