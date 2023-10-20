import { chromium } from '@playwright/test';
import { build } from 'esbuild';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as svelte from 'svelte/compiler';
import { afterAll, assert, beforeAll, describe, it } from 'vitest';
import { pretty_print_browser_assertion, try_load_config } from '../helpers.js';

const assert_file = path.resolve(__dirname, 'assert.js');

/** @type {import('@playwright/test').Browser} */
let browser;

beforeAll(async () => {
	browser = await chromium.launch();
	console.log('[runtime-browser] Launched browser');
}, 20000);

afterAll(async () => {
	if (browser) await browser.close();
});

describe.concurrent(
	'runtime (browser)',
	async () => {
		await Promise.all(
			fs.readdirSync(`${__dirname}/samples`).map(async (dir) => {
				await run_browser_test(dir);
			})
		);
	},
	// Browser tests are brittle and slow on CI
	{ timeout: 20000, retry: process.env.CI ? 1 : 0 }
);

async function run_browser_test(dir) {
	if (dir[0] === '.') return;

	const cwd = `${__dirname}/samples/${dir}`;

	// TODO: Vitest currently doesn't register a watcher because the import is hidden
	const config = await try_load_config(`${cwd}/_config.js`);
	const solo = config.solo || /\.solo/.test(dir);
	const skip = config.skip || /\.skip/.test(dir);

	const it_fn = skip ? it.skip : solo ? it.only : it;

	let failed = false;
	it_fn.each([false, true])(`${dir} hydrate: %s`, async (hydrate) => {
		if (hydrate && config.skip_if_hydrate) return;
		if (failed) {
			// this makes debugging easier, by only printing compiled output once
			assert.fail('skipping test, already failed');
		}

		const warnings = [];

		const build_result = await build({
			entryPoints: [`${__dirname}/driver.js`],
			write: false,
			alias: {
				__MAIN_DOT_SVELTE__: path.resolve(__dirname, 'samples', dir, 'main.svelte'),
				__CONFIG__: path.resolve(__dirname, 'samples', dir, '_config.js'),
				'assert.js': assert_file
			},
			plugins: [
				{
					name: 'testing-runtime-browser',
					setup(build) {
						build.onLoad({ filter: /\.svelte$/ }, ({ path }) => {
							const compiled = svelte.compile(fs.readFileSync(path, 'utf-8').replace(/\r/g, ''), {
								...config.compileOptions,
								hydratable: hydrate,
								immutable: config.immutable,
								accessors: 'accessors' in config ? config.accessors : true
							});

							compiled.warnings.forEach((warning) => warnings.push(warning));

							return {
								contents: compiled.js.code,
								loader: 'js'
							};
						});
					}
				}
			],
			define: {
				__HYDRATE__: hydrate ? 'true' : 'false'
			},
			bundle: true,
			format: 'iife',
			globalName: 'test'
		});

		function assert_warnings() {
			if (config.warnings) {
				assert.deepStrictEqual(
					warnings.map((w) => ({
						code: w.code,
						message: w.message,
						pos: w.pos,
						start: w.start,
						end: w.end
					})),
					config.warnings
				);
			} else if (warnings.length) {
				failed = true;
				/* eslint-disable no-unsafe-finally */
				throw new Error('Received unexpected warnings');
			}
		}

		assert_warnings();

		try {
			const page = await browser.newPage();
			page.on('console', (type) => {
				console[type.type()](type.text());
			});
			await page.setContent('<main></main>');
			await page.evaluate(build_result.outputFiles[0].text);
			const test_result = await page.evaluate("test.default(document.querySelector('main'))");

			if (test_result) console.log(test_result);
			await page.close();
		} catch (err) {
			failed = true;
			pretty_print_browser_assertion(err.message);
			throw err;
		}
	});
}

describe.concurrent(
	'custom-elements',
	async () => {
		await Promise.all(
			fs
				.readdirSync(`${__dirname}/custom-elements-samples`)
				.map((dir) => run_custom_elements_test(dir))
		);
	},
	// Browser tests are brittle and slow on CI
	{ timeout: 20000, retry: process.env.CI ? 1 : 0 }
);

async function run_custom_elements_test(dir) {
	if (dir[0] === '.') return;
	const cwd = `${__dirname}/custom-elements-samples/${dir}`;

	const solo = /\.solo$/.test(dir);
	const skip = /\.skip$/.test(dir);

	const warnings = [];
	const it_fn = solo ? it.only : skip ? it.skip : it;

	it_fn(dir, async () => {
		// TODO: Vitest currently doesn't register a watcher because the import is hidden
		const config = await try_load_config(`${cwd}/_config.js`);

		const expected_warnings = config.warnings || [];

		const build_result = await build({
			entryPoints: [`${cwd}/test.js`],
			write: false,
			alias: {
				'assert.js': assert_file
			},
			plugins: [
				{
					name: 'testing-runtime-browser',
					setup(build) {
						build.onLoad({ filter: /\.svelte$/ }, ({ path }) => {
							const compiled = svelte.compile(fs.readFileSync(path, 'utf-8').replace(/\r/g, ''), {
								customElement: true,
								dev: config.dev
							});
							compiled.warnings.forEach((w) => warnings.push(w));
							return {
								contents: compiled.js.code,
								loader: 'js'
							};
						});
					}
				}
			],
			bundle: true,
			format: 'iife',
			globalName: 'test'
		});

		function assert_warnings() {
			if (expected_warnings) {
				assert.deepStrictEqual(
					warnings.map((w) => ({
						code: w.code,
						message: w.message,
						pos: w.pos,
						start: w.start,
						end: w.end
					})),
					expected_warnings
				);
			}
		}
		assert_warnings();

		const page = await browser.newPage();
		page.on('console', (type) => {
			console[type.type()](type.text());
		});
		await page.setContent('<main></main>');
		await page.evaluate(build_result.outputFiles[0].text);
		const test_result = await page.evaluate("test.default(document.querySelector('main'))");

		if (test_result) console.log(test_result);

		await page.close();
	});
}
