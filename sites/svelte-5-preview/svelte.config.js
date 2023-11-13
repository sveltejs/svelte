import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
export default {
	kit: {
		adapter: adapter({
			runtime: 'nodejs18.x'
		}),

		prerender: {
			handleMissingId(details) {
				// do nothing
			}
		}
	},

	vitePlugin: {
		inspector: true
	}
};
