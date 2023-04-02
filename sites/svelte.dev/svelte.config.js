// @ts-check
import adapter from '@sveltejs/adapter-vercel';
import { get_examples_data, get_examples_list } from './src/lib/server/examples/get-examples.js';
import { get_tutorial_data, get_tutorial_list } from './src/lib/server/tutorial/get-tutorial.js';

/** @type {import('@sveltejs/kit').Config} */
export default {
	kit: {
		adapter: adapter(),
		prerender: {
			// TODO use route entries instead, once https://github.com/sveltejs/kit/pull/9571 is merged
			entries: ['*', ...repl_json_entries(), ...tutorial_entries()]
		}
	}
};

function repl_json_entries() {
	return get_examples_list(
		get_examples_data(new URL('../../site/content/examples', import.meta.url).pathname)
	).flatMap(({ examples }) =>
		examples.map(({ slug }) => /** @type {(`/${string}`)} */ (`/repl/${slug}.json`))
	);
}

function tutorial_entries() {
	return get_tutorial_list(
		get_tutorial_data(new URL('../../site/content/tutorial', import.meta.url).pathname)
	).flatMap(({ tutorials }) =>
		tutorials.map(({ slug }) => /** @type {(`/${string}`)} */ (`/tutorial/${slug}`))
	);
}
