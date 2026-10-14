import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import { compile } from 'svelte/compiler';
import { assert, it } from 'vitest';

for (const styled of [false, true]) {
	it(`preserves the component after a failed HMR update${styled ? ' with CSS' : ''}`, async () => {
		const result = await build({
			stdin: {
				contents: `
					export { default as Initial } from './Initial.svelte';
					export { default as Updated } from './Updated.svelte';
					export { mount, unmount, flushSync } from 'svelte';
				`,
				resolveDir: __dirname
			},
			bundle: true,
			write: false,
			format: 'iife',
			globalName: 'app',
			conditions: ['browser', 'development'],
			define: { 'import.meta.hot': 'window.hot' },
			plugins: [
				{
					name: 'svelte',
					setup(build) {
						build.onResolve({ filter: /\.svelte$/ }, ({ path }) => ({ path, namespace: 'svelte' }));
						build.onLoad({ filter: /./, namespace: 'svelte' }, ({ path }) => {
							const updated = path.includes('Updated');
							const source =
								`<h1>${updated ? 'updated' : 'initial'}</h1>` +
								(styled ? `<style>h1 { color: ${updated ? 'blue' : 'red'}; }</style>` : '');
							return {
								contents: compile(source, {
									filename: path,
									dev: true,
									hmr: true,
									css: 'injected',
									cssHash: () => 'svelte-hmr-test'
								}).js.code,
								resolveDir: __dirname
							};
						});
					}
				}
			]
		});

		const dom = new JSDOM('<main></main>', { runScripts: 'dangerously' });
		try {
			const callbacks: ((module: { default: unknown } | undefined) => void)[] = [];
			dom.window.hot = {
				accept: (callback: (typeof callbacks)[number]) => callbacks.push(callback)
			};
			dom.window.eval(result.outputFiles[0].text);
			const { app, document } = dom.window;
			const target = document.querySelector('main');
			const component = app.mount(app.Initial, { target });
			app.flushSync();
			assert.equal(target?.textContent, 'initial');
			const style = document.querySelector('style');
			if (styled) assert.ok(style);

			// Vite passes undefined when importing the updated module fails.
			assert.doesNotThrow(() => callbacks[0](undefined));
			app.flushSync();
			assert.equal(target?.textContent, 'initial');
			assert.equal(document.querySelector('style'), style);

			callbacks[0]({ default: app.Updated });
			app.flushSync();
			assert.equal(target?.textContent, 'updated');
			if (styled) assert.include(document.querySelector('style')?.textContent, 'blue');
			await app.unmount(component);
		} finally {
			dom.window.close();
		}
	});
}
