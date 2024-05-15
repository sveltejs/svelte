import { chromium } from '@playwright/test';
import { build } from 'esbuild';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { compile } from 'svelte/compiler';
import { afterAll, assert, beforeAll, describe } from 'vitest';
import { suite, suite_with_variants } from '../suite';
import { write } from '../helpers';
import type { Warning } from '#compiler';

const assert_file = path.resolve(__dirname, 'assert.js');

let browser: import('@playwright/test').Browser;

beforeAll(async () => {
	browser = await chromium.launch();
}, 20000);

afterAll(async () => {
	if (browser) await browser.close();
});

const { run: run_browser_tests } = suite_with_variants<
	ReturnType<typeof import('./assert').test>,
	'dom' | 'hydrate',
	void
>(
	['dom', 'hydrate'],
	(variant, config) => {
		if (variant === 'hydrate') {
			if (config.mode && !config.mode.includes('hydrate')) return 'no-test';
			if (config.skip_mode?.includes('hydrate')) return true;
		}

		return false;
	},
	() => {},
	async (config, test_dir, variant) => {
		await run_test(test_dir, config, variant === 'hydrate');
	}
);

describe.concurrent(
	'runtime-browser',
	() => run_browser_tests(__dirname),
	// Browser tests are brittle and slow on CI
	{ timeout: 20000, retry: process.env.CI ? 1 : 0 }
);

const { run: run_ce_tests } = suite<ReturnType<typeof import('./assert').test>>(
	async (config, test_dir) => {
		await run_test(test_dir, config, false);
	}
);

describe.concurrent(
	'custom-elements',
	() => run_ce_tests(__dirname, 'custom-elements-samples'),
	// Browser tests are brittle and slow on CI
	{ timeout: 20000, retry: process.env.CI ? 1 : 0 }
);

async function run_test(
	test_dir: string,
	config: ReturnType<typeof import('./assert').test>,
	hydrate: boolean
) {
	const warnings: any[] = [];

	const build_result = await build({
		entryPoints: [`${__dirname}/driver.js`],
		write: false,
		define: {
			__HYDRATE__: String(hydrate),
			__CE_TEST__: String(test_dir.includes('custom-elements-samples'))
		},
		alias: {
			__MAIN_DOT_SVELTE__: path.resolve(test_dir, 'main.svelte'),
			__CONFIG__: path.resolve(test_dir, '_config.js'),
			'assert.js': assert_file
		},
		plugins: [
			{
				name: 'testing-runtime-browser',
				setup(build) {
					build.onLoad({ filter: /\.svelte$/ }, (args) => {
						const compiled = compile(fs.readFileSync(args.path, 'utf-8').replace(/\r/g, ''), {
							generate: 'client',
							...config.compileOptions,
							immutable: config.immutable,
							customElement: test_dir.includes('custom-elements-samples'),
							accessors: 'accessors' in config ? config.accessors : true
						});

						write(`${test_dir}/_output/client/${path.basename(args.path)}.js`, compiled.js.code);

						compiled.warnings.forEach((warning) => {
							if (warning.code === 'options_deprecated_accessors') return;
							warnings.push(warning);
						});

						if (compiled.css !== null) {
							compiled.js.code += `document.head.innerHTML += \`<style>${compiled.css.code}</style>\``;
							write(
								`${test_dir}/_output/client/${path.basename(args.path)}.css`,
								compiled.css.code
							);
						}

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

	let build_result_ssr;
	if (hydrate) {
		const ssr_entry = path.resolve(__dirname, '../../src/index-server.js');

		build_result_ssr = await build({
			entryPoints: [`${__dirname}/driver-ssr.js`],
			write: false,
			alias: {
				__MAIN_DOT_SVELTE__: path.resolve(test_dir, 'main.svelte'),
				__CONFIG__: path.resolve(test_dir, '_config.js')
			},
			plugins: [
				{
					name: 'testing-runtime-browser-ssr',
					setup(build) {
						// When running the server version of the Svelte files,
						// we also want to use the server export of the Svelte package
						build.onResolve({ filter: /./ }, (args) => {
							if (args.path === 'svelte') {
								return { path: ssr_entry };
							}
						});

						build.onLoad({ filter: /\.svelte$/ }, (args) => {
							const compiled = compile(fs.readFileSync(args.path, 'utf-8').replace(/\r/g, ''), {
								generate: 'server',
								...config.compileOptions,
								immutable: config.immutable,
								customElement: test_dir.includes('custom-elements-samples'),
								accessors: 'accessors' in config ? config.accessors : true
							});

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
			globalName: 'test_ssr'
		});
	}

	function assert_warnings() {
		if (config.warnings) {
			assert.deepStrictEqual(
				warnings.map(
					(w) =>
						({
							code: w.code,
							message: w.message,
							start: w.start,
							end: w.end
						}) as Warning
				),
				config.warnings
			);
		} else if (warnings.length) {
			/* eslint-disable no-unsafe-finally */
			console.warn(warnings);
			throw new Error('Received unexpected warnings');
		}
	}

	assert_warnings();

	try {
		const page = await browser.newPage();
		page.on('console', (type) => {
			// @ts-ignore
			console[type.type()](type.text());
		});

		if (build_result_ssr) {
			const result: any = await page.evaluate(
				build_result_ssr.outputFiles[0].text + '; test_ssr.default()'
			);
			await page.setContent('<head>' + result.head + '</head><main>' + result.html + '</main>');
		} else {
			await page.setContent('<main></main>');
		}

		// uncomment to see what was generated
		// fs.writeFileSync(`${test_dir}/_actual.js`, build_result.outputFiles[0].text);
		const test_result = await page.evaluate(
			build_result.outputFiles[0].text + ";test.default(document.querySelector('main'))"
		);

		if (test_result) console.log(test_result);
		await page.close();
	} catch (err: any) {
		pretty_print_browser_assertion(err.message);
		throw err;
	}
}

function pretty_print_browser_assertion(message: string) {
	const match = /Error: Expected "(.+)" to equal "(.+)"/.exec(message);

	if (match) {
		assert.equal(match[1], match[2]);
	}
}
