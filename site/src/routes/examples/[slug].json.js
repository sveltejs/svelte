import { get_example } from './_examples.js';

const cache = new Map();

export function get({ params }) {
	const { slug } = params;

	let example = cache.get(slug);

	if (!example || process.env.NODE_ENV !== 'production') {
		example = get_example(slug);
		if (example) cache.set(slug, example);
	}

	if (example) {
		return {
			body: example
		};
	}
}
