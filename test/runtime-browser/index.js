import virtual from '@rollup/plugin-virtual';
import * as fs from 'fs';
import * as path from 'path';
import { rollup } from 'rollup';

import { chromium } from '@playwright/test';
import { deepStrictEqual } from 'assert';
import { loadConfig, loadSvelte, mkdirp, prettyPrintBrowserAssertionError } from '../helpers';

const internal = path.resolve('internal/index.mjs');
const index = path.resolve('index.mjs');

const assert = fs.readFileSync(`${__dirname}/assert.js`, 'utf-8');

describe('runtime (browser)', function () {
	this.timeout(20000);

	let svelte;
	let browser;

	before(async () => {
		svelte = loadSvelte(false);
		console.log('[runtime-browser] Loaded Svelte');

		browser = await chromium.launch();
		console.log('[runtime-browser] Launched browser');
	});

	after(async () => {
		if (browser) await browser.close();
	});

	const failed = new Set();

	function runTest(dir, hydrate) {
		if (dir[0] === '.') return;

		const config = loadConfig(`${__dirname}/samples/${dir}/_config.js`);
		const solo = config.solo || /\.solo/.test(dir);
		const skip = config.skip || /\.skip/.test(dir);

		if (hydrate && config.skip_if_hydrate) return;

		if (solo && process.env.CI) {
			throw new Error('Forgot to remove `solo: true` from test');
		}

		(skip ? it.skip : solo ? it.only : it)(
			`${dir} ${hydrate ? '(with hydration)' : ''}`,
			async () => {
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
									return 'main';
								}
							},
							load(id) {
								if (id === 'main') {
									return `
									import SvelteComponent from ${JSON.stringify(path.join(__dirname, 'samples', dir, 'main.svelte'))};
									import config from ${JSON.stringify(path.join(__dirname, 'samples', dir, '_config.js'))};
									import * as assert from 'assert';

									export default async function (target) {
										let unhandled_rejection = false;
										function unhandled_rejection_handler(event) {
											unhandled_rejection = event.reason;
										}
										window.addEventListener('unhandledrejection', unhandled_rejection_handler);

										try {
											if (config.before_test) config.before_test();

											const options = Object.assign({}, {
												target,
												hydrate: ${String(!!hydrate)},
												props: config.props,
												intro: config.intro
											}, config.options || {});

											const component = new SvelteComponent(options);

											const waitUntil = async (fn, ms = 500) => {
												const start = new Date().getTime();
												do {
													if (fn()) return;
													await new Promise(resolve => window.setTimeout(resolve, 1));
												} while (new Date().getTime() <= start + ms);
											};

											if (config.html) {
												assert.htmlEqual(target.innerHTML, config.html);
											}

											if (config.test) {
												await config.test({
													assert,
													component,
													target,
													window,
													waitUntil,
												});

												component.$destroy();

												if (unhandled_rejection) {
													throw unhandled_rejection;
												}
											} else {
												component.$destroy();
												assert.htmlEqual(target.innerHTML, '');

												if (unhandled_rejection) {
													throw unhandled_rejection;
												}
											}

											if (config.after_test) config.after_test();
										} catch (error) {
											if (config.error) {
												assert.equal(err.message, config.error);
											} else {
												throw error;
											}
										} finally {
											window.removeEventListener('unhandledrejection', unhandled_rejection_handler);
										}
									}
								`;
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

									mkdirp(out_dir);
									fs.writeFileSync(out, compiled.js.code, 'utf8');

									compiled.warnings.forEach((w) => warnings.push(w));

									return compiled.js;
								}
							}
						},
						virtual({ assert })
					]
				});

				const generated_bundle = await bundle.generate({ format: 'iife', name: 'test' });

				function assertWarnings() {
					if (config.warnings) {
						deepStrictEqual(
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
					const test_result = await page.evaluate(`test(document.querySelector('main'))`);

					if (test_result) console.log(test_result);
					assertWarnings();
					await page.close();
				} catch (err) {
					failed.add(dir);
					prettyPrintBrowserAssertionError(err.message);
					assertWarnings();
					throw err;
				}
			}
		);
	}

	fs.readdirSync(`${__dirname}/samples`).forEach((dir) => {
		runTest(dir, false);
		runTest(dir, true);
	});
});
