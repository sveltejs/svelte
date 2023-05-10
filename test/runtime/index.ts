import * as path from 'path';
import * as fs from 'fs';
import { rollup } from 'rollup';
import virtual from '@rollup/plugin-virtual';
import { clear_loops, flush, set_now, set_raf } from '../../internal';
import * as register from '../register';

import {
	assert,
	loadConfig,
	loadSvelte,
	env,
	setupHtmlEqual
} from '../helpers';

let svelte$;
let svelte;

let unhandled_rejection = false;
function unhandledRejection_handler(err) {
	unhandled_rejection = err;
}

describe('runtime', () => {
	before(() => {
		process.on('unhandledRejection', unhandledRejection_handler);
		svelte = loadSvelte(false);
		svelte$ = loadSvelte(true);

		return setupHtmlEqual();
	});
	after(() => process.removeListener('unhandledRejection', unhandledRejection_handler));

	const failed = new Set();

	function runTest(dir, hydrate, from_ssr_html) {
		if (dir[0] === '.') return;

		const config = loadConfig(`${__dirname}/samples/${dir}/_config.js`);
		const solo = config.solo || /\.solo/.test(dir);

		if (hydrate && config.skip_if_hydrate) return;
		if (hydrate && from_ssr_html && config.skip_if_hydrate_from_ssr) return;

		if (solo && process.env.CI) {
			throw new Error('Forgot to remove `solo: true` from test');
		}

		const testName = `${dir} ${hydrate ? `(with hydration${from_ssr_html ? ' from ssr rendered html' : ''})` : ''}`;
		(config.skip ? it.skip : solo ? it.only : it)(testName, () => {
			if (failed.has(dir)) {
				// this makes debugging easier, by only printing compiled output once
				throw new Error('skipping test, already failed');
			}

			unhandled_rejection = null;

			const cwd = path.resolve(`${__dirname}/samples/${dir}`);

			const compileOptions = {
				...config.compileOptions,
				hydratable: hydrate,
				immutable: config.immutable,
				accessors: 'accessors' in config ? config.accessors : true
			};
			let mod;
			let SvelteComponent;

			let unintendedError = null;

			const window = env();

			return Promise.resolve()
				.then(() => {
					// hack to support transition tests
					clear_loops();

					const raf = {
						time: 0,
						callback: null,
						tick: now => {
							raf.time = now;
							if (raf.callback) raf.callback();
						}
					};
					set_now(() => raf.time);
					set_raf(cb => {
						raf.callback = () => {
							raf.callback = null;
							cb(raf.time);
							flush();
						};
					});
		
					register.clearCompileOutputCache();
					register.clearRequireCache();
					register.setCompile((config.preserveIdentifiers ? svelte : svelte$).compile);
					register.setCompileOptions(compileOptions);
					register.setOutputFolderName(hydrate ? 'hydratable' : 'normal');
		
					mod = require(`./samples/${dir}/main.svelte`);
					SvelteComponent = mod.default;

					// Put things we need on window for testing
					window.SvelteComponent = SvelteComponent;

					const target = window.document.querySelector('main');

					if (hydrate && from_ssr_html) {
						// ssr into target
						register.setCompileOptions({ ...compileOptions, generate: 'ssr' });
						register.setOutputFolderName('hydratable-ssr');
						register.clearRequireCache();
						const SsrSvelteComponent = require(`./samples/${dir}/main.svelte`).default;
						const { html } = SsrSvelteComponent.render(config.props);
						target.innerHTML = html;
					} else {
						target.innerHTML = '';
					}

					if (config.before_test) config.before_test();

					const warnings = [];
					const warn = console.warn;
					console.warn = warning => {
						warnings.push(warning);
					};

					const options = Object.assign({}, {
						target,
						hydrate,
						props: config.props,
						intro: config.intro
					}, config.options || {});

					const component = new SvelteComponent(options);

					console.warn = warn;

					if (config.error) {
						unintendedError = true;
						throw new Error('Expected a runtime error');
					}

					if (config.warnings) {
						assert.deepEqual(warnings, config.warnings);
					} else if (warnings.length) {
						unintendedError = true;
						throw new Error('Received unexpected warnings');
					}

					if (config.html) {
						assert.htmlEqual(target.innerHTML, config.html);
					}

					if (config.test) {
						return Promise.resolve(config.test({
							assert,
							component,
							mod,
							target,
							window,
							raf,
							compileOptions,
							require: function require_for_csr(module: string) {
								register.clearRequireCache();
								register.setCompileOptions({
									format: 'cjs'
								});
								return require(path.join(`${__dirname}/samples/${dir}`, module));
							}							
						})).then(() => {
							component.$destroy();

							if (unhandled_rejection) {
								throw unhandled_rejection;
							}
						});
					} else {
						component.$destroy();
						assert.htmlEqual(target.innerHTML, '');

						if (unhandled_rejection) {
							throw unhandled_rejection;
						}
					}
				})
				.catch(err => {
					if (config.error && !unintendedError) {
						if (typeof config.error === 'function') {
							config.error(assert, err);
						} else {
							assert.equal(err.message, config.error);
						}
					} else {
						throw err;
					}
				}).catch(err => {
					failed.add(dir);
					// print a clickable link to open the directory
					err.stack += `\n\ncmd-click: ${path.relative(process.cwd(), cwd)}/main.svelte`;
					// saves the compiled output into file system
					register.writeCompileOutputCacheToFile();
					throw err;
				})
				.then(() => {
					flush();

					if (config.after_test) config.after_test();
				});
		});
	}

	fs.readdirSync(`${__dirname}/samples`).forEach(dir => {
		runTest(dir, false);
		runTest(dir, true, false);
		runTest(dir, true, true);
	});

	async function create_component(src = '<div></div>') {
		const { js } = svelte$.compile(src, {
			format: 'esm',
			name: 'SvelteComponent',
			dev: true
		});

		const bundle = await rollup({
			input: 'main.js',
			plugins: [
				virtual({
					'main.js': js.code
				}),
				{
					name: 'svelte-packages',
					resolveId: (importee) => {
						if (importee.startsWith('svelte/')) {
							return importee.replace('svelte', process.cwd()) + '/index.mjs';
						}
					}
				}
			]
		});

		const result = await bundle.generate({
			format: 'iife',
			name: 'App'
		});

		return eval(
			`(function () { ${result.output[0].code}; return App; }())`
		);
	}

	it('fails if options.target is missing in dev mode', async () => {
		const App = await create_component();

		assert.throws(() => {
			new App();
		}, /'target' is a required option/);
	});

	it('fails if options.hydrate is true but the component is non-hydratable', async () => {
		const App = await create_component();

		assert.throws(() => {
			new App({
				target: { childNodes: [] },
				hydrate: true
			});
		}, /options.hydrate only works if the component was compiled with the `hydratable: true` option/);
	});
});
