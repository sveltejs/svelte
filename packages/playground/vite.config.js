import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

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
