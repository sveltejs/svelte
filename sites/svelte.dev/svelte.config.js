// @ts-check
import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
export default {
	kit: {
		adapter: adapter(),
		inlineStyleThreshold: 25000
	},

	vitePlugin: {
		inspector: true
	}
};
