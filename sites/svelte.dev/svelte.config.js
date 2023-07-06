// @ts-check
import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
export default {
	kit: {
		adapter: adapter({ runtime: 'edge' }),
		prerender: {
			concurrency: 10
		}
	},

	vitePlugin: {
		inspector: true
	}
};
