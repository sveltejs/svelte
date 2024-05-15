import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
export default {
	compilerOptions: {
		legacy: {
			// site-kit manually instantiates components inside an action
			componentApi: true
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
