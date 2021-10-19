import get_sections from './_sections.js';

let json;

export function get() {
	if (!json || process.env.NODE_ENV !== 'production') {
		json = get_sections();
	}

	return {
		body: json
	};
}
