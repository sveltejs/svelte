import { defineConfig } from 'vite';
import inspect from 'vite-plugin-inspect';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const hmr = true;

export default defineConfig({
	build: {
		minify: false
	},

	plugins: [
		inspect(),
		svelte({
			compilerOptions: {
				hmr
			}
		})
	],

	optimizeDeps: {
		// svelte is a local workspace package, optimizing it would require dev server restarts with --force for every change
		exclude: ['svelte']
	}
});
