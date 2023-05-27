import { createFilter, defineConfig } from 'vite';
import { compile } from '../svelte/src/compiler';

const filter = createFilter('**/*.svelte');

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		{
			name: 'svelte',
			transform(code, id, options) {
				if (!filter(id)) return null;

				const compiled = compile(code, {
					filename: id,
					generate: options?.ssr ? 'ssr' : 'dom',
					hydratable: true,
					css: 'injected'
				});

				return compiled.js;
			},
			configureServer(server) {
				server.watcher.on('change', (path) => {
					if (path.includes('src/compiler')) {
						// pre-emptively send a full reload so that the request finishes faster
						server.ws.send({
							type: 'full-reload'
						});
					}
				});
			}
		}
	],
	server: {
		watch: {
			ignored: ['!**/node_modules/svelte/**']
		}
	}
});
