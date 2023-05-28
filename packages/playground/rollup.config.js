import { compile } from '../svelte/src/compiler/index.js';
import { rollup } from 'rollup';
import { SourceTextModule } from 'node:vm';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import serve from 'rollup-plugin-serve';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const create_plugin = (ssr = false) =>
	/** @type {import('rollup').Plugin}*/ ({
		name: 'custom-svelte-' + ssr,
		resolveId(id) {
			if (id === 'svelte') {
				return path.resolve(__dirname, '../svelte/src/runtime/index.js');
			} else if (id.startsWith('svelte/')) {
				return path.resolve(__dirname, `../svelte/src/runtime/${id.slice(7)}/index.js`);
			}
		},
		transform(code, id) {
			code = code.replace('import.meta.env.SSR', ssr);

			if (!id.endsWith('.svelte')) {
				return {
					code,
					map: null
				};
			}

			const compiled = compile(code, {
				filename: id,
				generate: ssr ? 'ssr' : 'dom',
				hydratable: true,
				css: 'injected'
			});
			return compiled.js;
		}
	});

const client_plugin = create_plugin();
const ssr_plugin = create_plugin(true);

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
	input: 'src/entry-client.js',
	output: {
		dir: 'dist',
		format: 'esm',
		sourcemap: true
	},
	plugins: [
		client_plugin,
		serve('dist'),
		{
			name: 'ssr',
			async generateBundle() {
				const build = await rollup({
					input: 'src/entry-server.js',
					plugins: [ssr_plugin]
				});

				const result = await build.generate({
					format: 'esm'
				});

				const mod = new SourceTextModule(result.output[0].code);
				await mod.link(() => {});
				await mod.evaluate();
				const { html } = mod.namespace.render();
				writeFileSync(
					'dist/index.html',
					readFileSync('src/template.html', 'utf-8').replace('<!--app-html-->', html)
				);
				writeFileSync('dist/version.json', Date.now().toString());
			}
		}
	]
};
