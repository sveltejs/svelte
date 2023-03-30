// @ts-check
import adapter from '@sveltejs/adapter-vercel';
import { get_examples_data, get_examples_list } from './src/lib/server/examples/get-examples.js';
import { get_tutorial_data, get_tutorial_list } from './src/lib/server/tutorial/get-tutorial.js';

/** @type {import('@sveltejs/kit').Config} */
export default {
	kit: {
		adapter: adapter(),
		prerender: {
			// TODO: REMOVE
			handleMissingId: 'ignore',
			entries: ['*', ...replJsonEntries(), ...tutorialEntries()],
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

/** @returns {('*' | `/${string}`)[]} */
function tutorialEntries() {
	// @ts-ignore
	return get_tutorial_list(
		get_tutorial_data(new URL('../../site/content/tutorial', import.meta.url).pathname)
	).flatMap(({ tutorials }) => tutorials.map(({ slug }) => `/tutorial/${slug}`));
}
