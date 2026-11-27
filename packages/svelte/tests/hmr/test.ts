import { chromium, type Browser } from '@playwright/test';
import { build } from 'esbuild';
import * as path from 'node:path';
import { compile } from 'svelte/compiler';
import { afterAll, assert, beforeAll, test } from 'vitest';

let browser: Browser;

beforeAll(async () => {
	browser = await chromium.launch();
}, 20000);

afterAll(async () => {
	await browser?.close();
});

for (const styled of [false, true]) {
	test(`failed HMR preserves the current component${styled ? ' and styles' : ''}`, async () => {
		const result = await build({
			absWorkingDir: path.resolve(__dirname, '../../../..'),
			stdin: {
				contents: `
					import Main from './main.svelte';
					import Next from './next.svelte';
					import { mount, flushSync } from 'svelte';
					mount(Main, { target: document.querySelector('main') });
					export function fail() { globalThis.callbacks[0](undefined); flushSync(); }
					export function update() { globalThis.callbacks[0]({ default: Next }); flushSync(); }
				`,
				resolveDir: path.resolve(__dirname, '../../../..')
			},
			bundle: true,
			write: false,
			format: 'iife',
			globalName: 'hmr_test',
			conditions: ['browser', 'development'],
			define: { 'import.meta.hot': 'globalThis.hot' },
			plugins: [
				{
					name: 'hmr-components',
					setup(build) {
						build.onResolve({ filter: /\.svelte$/ }, ({ path }) => ({
							path,
							namespace: 'hmr-component'
						}));
						build.onLoad({ filter: /.*/, namespace: 'hmr-component' }, ({ path: filename }) => {
							const next = filename.endsWith('next.svelte');
							const source = `
								<script>let count = $state(0);</script>
								<button onclick={() => count++}>${next ? 'updated' : 'initial'} {count}</button>
								${styled ? `<style>button { color: ${next ? 'blue' : 'red'}; }</style>` : ''}
							`;
							return {
								contents: compile(source, { filename, dev: true, hmr: true, css: 'injected' }).js
									.code,
								resolveDir: path.resolve(__dirname, '../../../..')
							};
						});
					}
				}
			]
		});

		const page = await browser.newPage();
		try {
			await page.setContent('<main></main>');
			await page.addScriptTag({
				content:
					'globalThis.callbacks = []; globalThis.hot = { accept: (callback) => callbacks.push(callback) };'
			});
			await page.addScriptTag({ content: result.outputFiles[0].text });
			const button = page.locator('button');
			for (let i = 0; i < 3; i++) await button.click();
			assert.equal(await button.textContent(), 'initial 3');

			await page.evaluate('hmr_test.fail()');
			assert.equal(await button.textContent(), 'initial 3');
			if (styled) {
				assert.equal(await page.locator('style').count(), 1);
				assert.equal(
					await button.evaluate((node) => getComputedStyle(node).color),
					'rgb(255, 0, 0)'
				);
			}

			await page.evaluate('hmr_test.update()');
			assert.equal(await button.textContent(), 'updated 0');
			if (styled) {
				assert.equal(await page.locator('style').count(), 1);
				assert.equal(
					await button.evaluate((node) => getComputedStyle(node).color),
					'rgb(0, 0, 255)'
				);
			}
		} finally {
			await page.close();
		}
	});
}
