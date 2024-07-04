import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
export default {
	compilerOptions: {
		compatibility: {
			// site-kit manually instantiates components inside an action
			legacyComponent: true
		}
	},
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
		inspector: false
	}
};
