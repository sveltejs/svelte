import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { rollup } from 'rollup';
import { try_load_config } from '../helpers.js';
import * as svelte from '../../src/compiler/index.js';
import { beforeAll, describe, afterAll, assert, it } from 'vitest';

const internal = path.resolve('src/runtime/internal/index.js');
const index = path.resolve('src/runtime/index.js');

const browser_assert = fs.readFileSync(`${__dirname}/assert.js`, 'utf-8');

describe(
	'custom-elements',
	() => {
		/** @type {import('@playwright/test').Browser} */
		let browser;

		beforeAll(async () => {
			browser = await chromium.launch();
			console.log('[custom-elements] Launched browser');
		}, 20000);

		afterAll(async () => {
			if (browser) await browser.close();
		});

		fs.readdirSync(`${__dirname}/samples`).forEach((dir) => {
			if (dir[0] === '.') return;

			const solo = /\.solo$/.test(dir);
			const skip = /\.skip$/.test(dir);

			const warnings = [];
			const it_fn = solo ? it.only : skip ? it.skip : it;

			it_fn(dir, async () => {
				// TODO: Vitest currently doesn't register a watcher because the import is hidden
				const config = await try_load_config(`${__dirname}/samples/${dir}/_config.js`);

				const expected_warnings = config.warnings || [];

				const bundle = await rollup({
					input: `${__dirname}/samples/${dir}/test.js`,
					plugins: [
						{
							name: 'plugin-resolve-svelte',
							resolveId(importee) {
								if (importee === 'svelte/internal' || importee === './internal') {
									return internal;
								}

								if (importee === 'svelte') {
									return index;
								}

								if (importee === 'assert') {
									return 'assert';
								}
							},

							load(id) {
								if (id === 'assert') return browser_assert;
							},

							transform(code, id) {
								if (id.endsWith('.svelte')) {
									const compiled = svelte.compile(code.replace(/\r/g, ''), {
										customElement: true,
										dev: config.dev
									});

									compiled.warnings.forEach((w) => warnings.push(w));

									return compiled.js;
								}
							}
						}
					]
				});

				const generated_bundle = await bundle.generate({ format: 'iife', name: 'test' });

				function assertWarnings() {
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

				const page = await browser.newPage();
				page.on('console', (type) => {
					console[type.type()](type.text());
				});
				await page.setContent('<main></main>');
				await page.evaluate(generated_bundle.output[0].code);
				const test_result = await page.evaluate(`test(document.querySelector('main'))`);

				if (test_result) console.log(test_result);

				assertWarnings();

				await page.close();
			});
		});
	},
	// Browser tests are brittle and slow on CI
	{ timeout: 20000, retry: process.env.CI ? 1 : 0 }
);
