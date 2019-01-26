import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { rollup } from 'rollup';
import * as virtual from 'rollup-plugin-virtual';
import * as Nightmare from 'nightmare';
import { addLineNumbers, loadConfig, loadSvelte } from "../helpers.js";

const page = `
<body>
	<main></main>
	<script src='/bundle.js'></script>
</body>
`;

const assert = fs.readFileSync('test/custom-elements/assert.js', 'utf-8');

describe('custom-elements', function() {
	this.timeout(10000);

	let svelte;
	let server;
	let bundle;

	before(() => {
		svelte = loadSvelte();

		return new Promise((fulfil) => {
			server = http.createServer((req, res) => {
				if (req.url === '/') {
					res.end(page);
				}

				if (req.url === '/bundle.js') {
					res.end(bundle);
				}
			});

			server.listen('6789', () => {
				fulfil();
			});
		});
	});

	after(() => {
		server.close();
	});

	fs.readdirSync('test/custom-elements/samples').forEach(dir => {
		if (dir[0] === '.') return;

		const solo = /\.solo$/.test(dir);
		const skip = /\.skip$/.test(dir);
		const internal = path.resolve('internal.mjs');
		const index = path.resolve('index.mjs');

		(solo ? it.only : skip ? it.skip : it)(dir, () => {
			const config = loadConfig(`./custom-elements/samples/${dir}/_config.js`);

			return rollup({
				input: `test/custom-elements/samples/${dir}/test.js`,
				plugins: [
					{
						resolveId(importee) {
							if (importee === 'svelte/internal') {
								return internal;
							}

							if (importee === 'svelte') {
								return index;
							}
						},

						transform(code, id) {
							if (id.endsWith('.html')) {
								const compiled = svelte.compile(code, {
									customElement: true,
									dev: config.dev
								});

								return compiled.js;
							}
						}
					},

					virtual({
						assert
					})
				]
			})
				.then(bundle => bundle.generate({ format: 'iife', name: 'test' }))
				.then(result => {
					bundle = result.output[0].code;

					const nightmare = new Nightmare({ show: false });

					nightmare.on('console', (type, ...args) => {
						console[type](...args);
					});

					return nightmare
						.goto('http://localhost:6789')
						.evaluate(() => {
							return test(document.querySelector('main'));
						})
						.then(result => {
							if (result) console.log(result);
							return nightmare.end();
						})
						.catch(message => {
							console.log(addLineNumbers(bundle));
							return nightmare.end().then(() => {
								throw new Error(message);
							});
						});
				});


		});
	});
});
