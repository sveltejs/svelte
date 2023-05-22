import { chromium } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { rollup } from 'rollup';
import { pretty_print_browser_assertion, try_load_config } from '../helpers.js';
import * as svelte from '../../src/compiler/index.js';
import { beforeAll, describe, afterAll, assert } from 'vitest';

const internal = path.resolve('src/runtime/internal/index.js');
const index = path.resolve('src/runtime/index.js');

const main = fs.readFileSync(`${__dirname}/driver.js`, 'utf-8');
const browser_assert = fs.readFileSync(`${__dirname}/assert.js`, 'utf-8');

describe(
	'runtime (browser)',
	async (it) => {
		/** @type {import('@playwright/test').Browser} */
		let browser;

		beforeAll(async () => {
			browser = await chromium.launch();
			console.log('[runtime-browser] Launched browser');
		});

		afterAll(async () => {
			if (browser) await browser.close();
		});

		const failed = new Set();

		async function runTest(dir, hydrate) {
			if (dir[0] === '.') return;

			// TODO: Vitest currently doesn't register a watcher because the import is hidden
			const config = await try_load_config(`${__dirname}/samples/${dir}/_config.js`);
			const solo = config.solo || /\.solo/.test(dir);
			const skip = config.skip || /\.skip/.test(dir);

			if (hydrate && config.skip_if_hydrate) return;

			const it_fn = skip ? it.skip : solo ? it.only : it;

			it_fn(`${dir} ${hydrate ? '(with hydration)' : ''}`, async () => {
				if (failed.has(dir)) {
					// this makes debugging easier, by only printing compiled output once
					throw new Error('skipping test, already failed');
				}

				const warnings = [];

				const bundle = await rollup({
					input: 'main',
					plugins: [
						{
							name: 'testing-runtime-browser',
							resolveId(importee) {
								if (importee === 'svelte/internal' || importee === './internal') {
									return internal;
								}

								if (importee === 'svelte') {
									return index;
								}

								if (importee === 'main') {
									return '\0virtual:main';
								}

								if (importee === 'assert.js') {
									return '\0virtual:assert';
								}

								if (importee === '__MAIN_DOT_SVELTE__') {
									return path.resolve(__dirname, 'samples', dir, 'main.svelte');
								}

								if (importee === '__CONFIG__') {
									return path.resolve(__dirname, 'samples', dir, '_config.js');
								}
							},
							load(id) {
								if (id === '\0virtual:assert') return browser_assert;

								if (id === '\0virtual:main') {
									return main.replace('__HYDRATE__', hydrate ? 'true' : 'false');
								}
								return null;
							},
							transform(code, id) {
								if (id.endsWith('.svelte')) {
									const compiled = svelte.compile(code.replace(/\r/g, ''), {
										...config.compileOptions,
										hydratable: hydrate,
										immutable: config.immutable,
										accessors: 'accessors' in config ? config.accessors : true
									});

									const out_dir = `${__dirname}/samples/${dir}/_output/${
										hydrate ? 'hydratable' : 'normal'
									}`;
									const out = `${out_dir}/${path.basename(id).replace(/\.svelte$/, '.js')}`;

									if (fs.existsSync(out)) {
										fs.unlinkSync(out);
									}
									if (!fs.existsSync(out_dir)) {
										fs.mkdirSync(out_dir, { recursive: true });
									}

									fs.writeFileSync(out, compiled.js.code, 'utf8');

									compiled.warnings.forEach((w) => warnings.push(w));

									return compiled.js;
								}
							}
						}
					]
				});

				const generated_bundle = await bundle.generate({ format: 'iife', name: 'test' });

				function assertWarnings() {
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
						failed.add(dir);
						/* eslint-disable no-unsafe-finally */
						throw new Error('Received unexpected warnings');
					}
				}

				try {
					const page = await browser.newPage();
					page.on('console', (type) => {
						console[type.type()](type.text());
					});
					await page.setContent('<main></main>');
					await page.evaluate(generated_bundle.output[0].code);
					const test_result = await page.evaluate("test(document.querySelector('main'))");

					if (test_result) console.log(test_result);
					assertWarnings();
					await page.close();
				} catch (err) {
					failed.add(dir);
					pretty_print_browser_assertion(err.message);
					assertWarnings();
					throw err;
				}
			});
		}

		await Promise.all(
			fs.readdirSync(`${__dirname}/samples`).map(async (dir) => {
				await runTest(dir, false);
				await runTest(dir, true);
			})
		);
	},
	// Browser tests are brittle and slow on CI
	{ timeout: 20000, retry: process.env.CI ? 1 : 0 }
);
