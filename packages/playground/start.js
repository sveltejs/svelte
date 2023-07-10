import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { watch } from 'rollup';
import serve from 'rollup-plugin-serve';
import * as svelte from '../svelte/src/compiler/index.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/** @returns {import('rollup').Plugin}*/
function create_plugin(ssr = false) {
	return {
		name: 'custom-svelte-ssr-' + ssr,
		resolveId(id) {
			if (id === 'svelte') {
				return path.resolve(
					__dirname,
					ssr ? '../svelte/src/runtime/ssr.js' : '../svelte/src/runtime/index.js'
				);
			} else if (id.startsWith('svelte/')) {
				return path.resolve(__dirname, `../svelte/src/runtime/${id.slice(7)}/index.js`);
			}
		},
		transform(code, id) {
			code = code.replaceAll('import.meta.env.SSR', ssr);

			if (!id.endsWith('.svelte')) {
				return {
					code,
					map: null
				};
			}

			const compiled = svelte.compile(code, {
				filename: id,
				generate: ssr ? 'ssr' : 'dom',
				hydratable: true,
				css: 'injected'
			});

			return compiled.js;
		}
	};
}

const client_plugin = create_plugin();
const ssr_plugin = create_plugin(true);

const watcher = watch([
	{
		input: 'src/entry-client.js',
		output: {
			dir: 'dist',
			format: 'esm',
			sourcemap: true
		},
		plugins: [client_plugin, serve('dist')]
	},
	{
		input: 'src/entry-server.js',
		output: {
			dir: 'dist-ssr',
			format: 'iife',
			indent: false
		},
		plugins: [
			ssr_plugin,
			{
				async generateBundle(_, bundle) {
					const result = bundle['entry-server.js'];
					const mod = (0, eval)(result.code);
					const { html } = mod.render();

					writeFileSync(
						'dist/index.html',
						readFileSync('src/template.html', 'utf-8')
							.replace('<!--app-html-->', html)
							.replace('<!--app-title-->', svelte.VERSION)
					);
					writeFileSync('dist/version.json', Date.now().toString());
				}
			}
		],
		onwarn(warning, handler) {
			if (warning.code === 'MISSING_NAME_OPTION_FOR_IIFE_EXPORT') return;
			handler(warning);
		}
	}
]);

watcher
	.on('change', (id) => {
		console.log(`changed ${id}`);
	})
	.on('event', (event) => {
		if (event.code === 'ERROR') {
			console.error(event.error);
		} else if (event.code === 'BUNDLE_END') {
			console.log(`Generated ${event.output} in ${event.duration}ms`);
		}
	});
