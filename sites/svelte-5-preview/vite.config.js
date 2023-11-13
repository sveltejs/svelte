import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	resolve: {
		dedupe: ['@codemirror/state', '@codemirror/language', '@codemirror/view']
	},
	optimizeDeps: {
		exclude: ['@sveltejs/site-kit', '@sveltejs/kit', 'svelte']
	},
	ssr: { noExternal: ['@sveltejs/site-kit', '@sveltejs/kit', 'svelte'] },
	server: {
		fs: {
			strict: false
		}
	}
};

export default config;
