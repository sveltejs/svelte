import get_tutorials from './_tutorials.js';

let json;

export function get(req, res) {
	if (!json || process.env.NODE_ENV !== 'production') {
		json = JSON.stringify(get_tutorials());
	}

	res.set({
		'Content-Type': 'application/json'
	});

	res.end(json);
}