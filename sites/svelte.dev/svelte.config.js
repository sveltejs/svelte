// @ts-check
import adapter from '@sveltejs/adapter-vercel';
import { get_examples_data, get_examples_list } from './src/lib/server/examples/get-examples.js';

/** @type {import('@sveltejs/kit').Config} */
export default {
	kit: {
		adapter: adapter(),
		prerender: {
			// TODO: REMOVE
			handleMissingId: 'ignore',
			entries: ['*', ...replJsonEntries()],
		},
	},
};

/** @returns {('*' | `/${string}`)[]} */
function replJsonEntries() {
	// @ts-ignore
	return get_examples_list(
		get_examples_data(new URL('../../site/content/examples', import.meta.url).pathname)
	).flatMap(({ examples }) => examples.map(({ slug }) => `/repl/${slug}.json`));
}
