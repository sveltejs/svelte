import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { rollup } from 'rollup';
import * as virtual from '@rollup/plugin-virtual';
import * as puppeteer from 'puppeteer';
import { addLineNumbers, loadConfig, loadSvelte } from "../helpers.js";
import { deepEqual } from 'assert';

const page = `
<body>
	<main></main>
	<script src='/bundle.js'></script>
</body>
`;

const assert = fs.readFileSync(`${__dirname}/assert.js`, 'utf-8');

describe('custom-elements', function() {
	this.timeout(10000);

	let svelte;
	let server;
	let browser;
	let code;

	function create_server() {
		return new Promise((fulfil) => {
			const server = http.createServer((req, res) => {
				if (req.url === '/') {
					res.end(page);
				}

				if (req.url === '/bundle.js') {
					res.end(code);
				}
			});

			server.listen('6789', () => {
				fulfil(server);
			});
		});
	}

	before(async () => {
		svelte = loadSvelte();
		server = await create_server();
		browser = await puppeteer.launch();
	});

	after(async () => {
		server.close();
		await browser.close();
	});

	fs.readdirSync(`${__dirname}/samples`).forEach(dir => {
		if (dir[0] === '.') return;

		const solo = /\.solo$/.test(dir);
		const skip = /\.skip$/.test(dir);
		const internal = path.resolve('internal/index.mjs');
		const index = path.resolve('index.mjs');
		const warnings = [];

		(solo ? it.only : skip ? it.skip : it)(dir, async () => {
			const config = loadConfig(`./custom-elements/samples/${dir}/_config.js`);
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
								const compiled = svelte.compile(code, {
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

			const page = await browser.newPage();

			page.on('console', (type, ...args) => {
				console[type](...args);
			});

			page.on('error', error => {
				console.log('>>> an error happened');
				console.error(error);
			});

			try {
				await page.goto('http://localhost:6789');

				const result = await page.evaluate(() => test(document.querySelector('main')));
				if (result) console.log(result);
			} catch (err) {
				console.log(addLineNumbers(code));
				throw err;
			} finally {
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
		});
	});
});
