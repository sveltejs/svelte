import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { rollup } from 'rollup';
import * as virtual from '@rollup/plugin-virtual';

import { TestcafeController, testcafeHolder } from '../testcafeController.js';
import * as getPort from 'get-port';
import { platform as os_platform } from 'os';
import { execSync } from 'child_process';

import { addLineNumbers, loadConfig, loadSvelte } from "../helpers.js";
import { deepEqual } from 'assert';

const pageHtml = `\
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>Svelte Test</title>
	</head>
	<body>
		<main></main>
		<script src="/bundle.js"></script>
	</body>
</html>
`;

const assert = fs.readFileSync(`${__dirname}/assert.js`, 'utf-8');

const testGroup = 'custom-elements';
describe(testGroup, async function(env) {
	this.timeout(20000);

	let svelte;
	let server;
	let serverPort;
	let testcafe;
	let controller;
	let code;

	function create_server() {
		return new Promise((fulfil, reject) => {
			const server = http.createServer((req, res) => {
				if (req.url == '/') res.end(pageHtml);
				if (req.url == '/bundle.js') res.end(code);
			});
			server.on('error', reject);
			server.listen(serverPort, () => {
				fulfil(server);
			});
		});
	}

	before(async () => {
		this.timeout(10000);

		svelte = loadSvelte();
		console.log('    i Loaded Svelte');

		serverPort = await getPort();
		server = await create_server();
		console.log(`    i Started server at http://localhost:${serverPort}/`);

		// init testcafe

		// write tempfile
		TestcafeController.createTestFile({
			fixtureName: testGroup,
		});

		// guess browser
		const testcafeBrowserList = await TestcafeController.testcafeListLocalBrowsers();
		// browsers sorted by personal taste
		const preferredBrowsers = [
			'chrome', 'chromium', 'chrome-canary',
			'firefox', 'safari', 'opera', 'edge', 'ie',
		];
		// get default browser name: harder on windows, crazy hard on darwin
		// https://github.com/jakub-g/x-default-browser
		const userDefaultBrowser = ['linux', 'freebsd'].includes(os_platform())
			? execSync('xdg-mime query default x-scheme-handler/http').toString()
				.replace(/.*(firefox|chrome|chromium|opera).*\n/i, '$1').toLowerCase()
			: null;
		const browser = testcafeBrowserList.includes(userDefaultBrowser)
			? userDefaultBrowser
			: preferredBrowsers.find( // find first match
					b => testcafeBrowserList.includes(b)
				) || testcafeBrowserList[0];
		const HL = browser.match(/(firefox|chro)/) ? ':headless' : '';

		// find open ports
		const port1 = await getPort();
		const port2 = await getPort();

		console.log('    i Starting TestCafe in browser '+browser+HL);
		testcafe = await TestcafeController.createTestCafeWithRunner(
			[ browser+HL ], port1, port2,
		);

		console.log('    i Getting TestCafe controller');
		// this will print 'Running tests in: ....'
		const testController = await testcafeHolder.get();
		controller = new TestcafeController(testController);

		console.log('    i init done');
	});

	after(async () => {
		if (server) server.close();
		if (testcafe) await testcafe.close();
		TestcafeController.deleteTestFile();
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
								const compiled = svelte.compile(code.replace(/\r/g, ""), {
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

			const generated = await bundle.generate({ format: 'iife', name: 'test' });
			code = generated.output[0].code;

			try {
				//const t1 = (new Date()).getTime();

				// start loading test page
				await controller.t.navigateTo('http://localhost:'+serverPort+'/');

				await controller.t.wait(50); // TODO better?

				// wait for page load: retry loop
				// takes between 500 and 1500 ms
				let testFunc;
				for (let i = 0; i < 100; i++) {
					try {
						testFunc = controller.getFunc(
							() => (
								test(document.querySelector('main'))
							)
						);
						break;
					}
					catch (e) {
						// script not yet loaded
						// assert: e.errMsg == "ReferenceError: test is not defined"
						await controller.t.wait(50);
						process.stdout.write('.');
					}
				}

				const testResult = await testFunc();

				//const t2 = (new Date()).getTime();
				//console.log('      '+(t2-t1)+' ms for page load');

				// print console messages
				// in current version of testcafe
				// the messages are not sorted by time (bug)
				const testConsole = await controller.popConsole();
				['error', 'log', 'info', 'warn'].forEach(key => {
					if (testConsole[key].length > 0) {
						console.log(key+': '+testConsole[key].join('\n'+key+': '));
					}
				})

				if (testResult) console.log(testResult);
			}
			catch (err) {
				console.log(addLineNumbers(code));
				// testcafe error objects are verbose and useless
				throw err.errMsg ? new Error(err.errMsg) : err;
			}
			finally {
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
