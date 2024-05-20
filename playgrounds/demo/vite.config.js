import { defineConfig } from 'vite';
import inspect from 'vite-plugin-inspect';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [inspect(), svelte()],
	optimizeDeps: {
		// svelte is a local workspace package, optimizing it would require dev server restarts with --force for every change
		exclude: ['svelte']
	}
});
