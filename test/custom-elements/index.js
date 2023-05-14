import { chromium } from '@playwright/test';
import virtual from '@rollup/plugin-virtual';
import { deepStrictEqual } from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { rollup } from 'rollup';
import { loadConfig, loadSvelte } from '../helpers';

const assert = fs.readFileSync(`${__dirname}/assert.js`, 'utf-8');

describe('custom-elements', function () {
	this.timeout(20000);

	let svelte;
	/** @type {import('@playwright/test').Browser} */
	let browser;

	before(async function () {
		svelte = loadSvelte();
		console.log('[custom-elements] Loaded Svelte');
		browser = await chromium.launch();
		console.log('[custom-elements] Launched browser');
	});

	after(async () => {
		if (browser) await browser.close();
	});

	fs.readdirSync(`${__dirname}/samples`).forEach((dir) => {
		if (dir[0] === '.') return;

		const solo = /\.solo$/.test(dir);
		const skip = /\.skip$/.test(dir);
		const internal = path.resolve('internal/index.mjs');
		const index = path.resolve('index.mjs');
		const warnings = [];

		(solo ? it.only : skip ? it.skip : it)(dir, async () => {
			const config = loadConfig(`${__dirname}/samples/${dir}/_config.js`);
			const expected_warnings = config.warnings || [];

			const bundle = await rollup({
				input: `${__dirname}/samples/${dir}/test.js`,
				plugins: [
					// @ts-ignore -- TODO: fix this
					{
						resolveId(importee) {
							if (importee === 'svelte/internal' || importee === './internal') {
								return internal;
							}

							if (importee === 'svelte') {
								return index;
							}
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
					},

					virtual({
						assert
					})
				]
			});

			const generated_bundle = await bundle.generate({ format: 'iife', name: 'test' });

			function assertWarnings() {
				if (expected_warnings) {
					deepStrictEqual(
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
			page.close();
		});
	});
});
