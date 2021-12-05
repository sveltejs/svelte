import { get_examples } from './_examples.js';

let cached;

export function get() {
	if (!cached || process.env.NODE_ENV !== 'production') {
		cached = get_examples().filter(section => section.title);
	}

	try {
		return {
			body: cached
		};
	} catch(err) {
		return {
			status: e.status || 500,
			body: {
				message: e.message
			}
		};
	}
}
