import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { rollup } from 'rollup';
import virtual from '@rollup/plugin-virtual';
import puppeteer from 'puppeteer';
import { addLineNumbers, loadConfig, loadSvelte, retryAsync } from '../helpers';
import { deepEqual } from 'assert';

const page = `
<body>
	<main></main>
	<script src='/bundle.js'></script>
</body>
`;

const assert = fs.readFileSync(`${__dirname}/assert.js`, 'utf-8');

describe('custom-elements', function () {
	// Note: Increase the timeout in preparation for restarting Chromium due to SIGSEGV.
	this.timeout(10000);
	let svelte;
	let server;
	let browser;
	let code;

	function create_server() {
		return new Promise((fulfil, reject) => {
			const server = http.createServer((req, res) => {
				if (req.url === '/') {
					res.end(page);
				}

				if (req.url === '/bundle.js') {
					res.end(code);
				}
			});

			server.on('error', reject);

			server.listen('6789', () => {
				fulfil(server);
			});
		});
	}

	async function launchPuppeteer() {
		return await retryAsync(() => puppeteer.launch());
	}

	before(async () => {
		svelte = loadSvelte();
		console.log('[custom-element] Loaded Svelte');
		server = await create_server();
		console.log('[custom-element] Started server');
		browser = await launchPuppeteer();
		console.log('[custom-element] Launched puppeteer browser');
	});

	after(async () => {
		if (server) server.close();
		if (browser) await browser.close();
	});

	fs.readdirSync(`${__dirname}/samples`).forEach(dir => {
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

								compiled.warnings.forEach(w => warnings.push(w));

								return compiled.js;
							}
						}
					},

					virtual({
						assert
					})
				]
			});

			const result = await bundle.generate({ format: 'iife', name: 'test' });
			code = result.output[0].code;

			function assertWarnings() {
				if (expected_warnings) {
					deepEqual(warnings.map(w => ({
						code: w.code,
						message: w.message,
						pos: w.pos,
						start: w.start,
						end: w.end
					})), expected_warnings);
				}
			}

			// NOTE: Chromium may exit due to SIGSEGV, so retry in that case.
			let count = 0;
			do {
				count++;
				try {
					const page = await browser.newPage();

					page.on('console', (type) => {
						console[type._type](type._text);
					});

					page.on('error', error => {
						console.log('>>> an error happened');
						console.error(error);
					});

					await page.goto('http://localhost:6789');
					const result = await page.evaluate(() => test(document.querySelector('main')));
					if (result) console.log(result);
					assertWarnings();
					await page.close();
					break;
				} catch (err) {
					if (count === 5 || browser.isConnected()) {
						console.log(addLineNumbers(code));
						assertWarnings();
						throw err;
					}
					browser = await launchPuppeteer();
				}
			} while (count <= 5);
		});
	});
});
