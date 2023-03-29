// @ts-check
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
export default {
	kit: {
		adapter: adapter(),
		prerender: {
			// TODO: REMOVE
			handleMissingId: 'ignore',
		},
	},
};
