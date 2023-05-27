import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Do not remove this import. It's needed to trigger reloads when the compiler changes.
import { compile } from '../svelte/src/compiler/index.js';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		svelte({
			compilerOptions: {
				hydratable: true
			}
		})
	],
	server: {
		watch: {
			ignored: ['!**/node_modules/svelte/**']
		}
	}
});
