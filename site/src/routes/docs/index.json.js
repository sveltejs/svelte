import send from '@polka/send';
import get_sections from './_sections.js';

let json;

export function get(req, res) {
	if (!json || process.env.NODE_ENV !== 'production') {
		json = get_sections();
	}

	send(res, 200, json);
}
