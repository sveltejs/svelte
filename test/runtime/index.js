import * as assert from "assert";
import * as path from "path";
import * as fs from "fs";
import { rollup } from 'rollup';
import * as virtual from 'rollup-plugin-virtual';
import { clear_loops, set_now, set_raf } from "../../internal.js";

import {
	showOutput,
	loadConfig,
	loadSvelte,
	env,
	setupHtmlEqual
} from "../helpers.js";

let svelte$;
let svelte;

let compileOptions = null;
let compile = null;

const sveltePath = process.cwd().split('\\').join('/');
const internal = `${sveltePath}/internal.js`;

describe("runtime", () => {
	before(() => {
		svelte = loadSvelte(false);
		svelte$ = loadSvelte(true);

		require.extensions[".svelte"] = function(module, filename) {
			const options = Object.assign({
				filename,
				format: 'cjs',
				sveltePath
			}, compileOptions);

			const { js: { code } } = compile(fs.readFileSync(filename, "utf-8"), options);

			return module._compile(code, filename);
		};

		return setupHtmlEqual();
	});

	const failed = new Set();

	function runTest(dir, hydrate) {
		if (dir[0] === ".") return;

		const { flush } = require(internal);

		const config = loadConfig(`./runtime/samples/${dir}/_config.js`);

		if (hydrate && config.skip_if_hydrate) return;

		if (config.solo && process.env.CI) {
			throw new Error("Forgot to remove `solo: true` from test");
		}

		(config.skip ? it.skip : config.solo ? it.only : it)(`${dir} ${hydrate ? '(with hydration)' : ''}`, () => {
			if (failed.has(dir)) {
				// this makes debugging easier, by only printing compiled output once
				throw new Error('skipping test, already failed');
			}

			compile = (config.preserveIdentifiers ? svelte : svelte$).compile;

			const cwd = path.resolve(`test/runtime/samples/${dir}`);
			global.document.title = '';

			compileOptions = config.compileOptions || {};
			compileOptions.sveltePath = sveltePath;
			compileOptions.hydratable = hydrate;
			compileOptions.immutable = config.immutable;
			compileOptions.accessors = 'accessors' in config ? config.accessors : true;

			Object.keys(require.cache)
				.filter(x => x.endsWith('.svelte'))
				.forEach(file => {
					delete require.cache[file];
				});

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
						let called = false;
						raf.callback = () => {
							if (!called) {
								called = true;
								cb();
							}
						};
					});

					try {
						mod = require(`./samples/${dir}/main.svelte`);
						SvelteComponent = mod.default;
					} catch (err) {
						showOutput(cwd, compileOptions, compile); // eslint-disable-line no-console
						throw err;
					}

					global.window = window;

					if (config.before_test) config.before_test();

					// Put things we need on window for testing
					window.SvelteComponent = SvelteComponent;

					const target = window.document.querySelector("main");

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
						throw new Error("Expected a runtime error");
					}

					if (config.warnings) {
						assert.deepEqual(warnings, config.warnings);
					} else if (warnings.length) {
						unintendedError = true;
						throw new Error("Received unexpected warnings");
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
							raf
						})).then(() => {
							component.$destroy();
						});
					} else {
						component.$destroy();
						assert.htmlEqual(target.innerHTML, "");
					}
				})
				.catch(err => {
					if (config.error && !unintendedError) {
						if (typeof config.error === 'function') {
							config.error(assert, err);
						} else {
							assert.equal(config.error, err.message);
						}
					} else {
						failed.add(dir);
						showOutput(cwd, compileOptions, compile); // eslint-disable-line no-console
						throw err;
					}
				})
				.then(() => {
					if (config.show) {
						showOutput(cwd, compileOptions, compile);
					}

					flush();

					if (config.after_test) config.after_test();
				});
		});
	}

	fs.readdirSync("test/runtime/samples").forEach(dir => {
		runTest(dir, false);
		runTest(dir, true);
	});

	async function create_component(src = '<div></div>') {
		const { js } = svelte$.compile(src, {
			format: "esm",
			name: "SvelteComponent",
			dev: true
		});

		const bundle = await rollup({
			input: 'main.js',
			plugins: [
				virtual({
					'main.js': js.code
				}),
				{
					resolveId: (importee, importer) => {
						if (importee.startsWith('svelte/')) {
							return importee.replace('svelte', process.cwd()) + '.mjs';
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

	it("fails if options.target is missing in dev mode", async () => {
		const App = await create_component();

		assert.throws(() => {
			new App();
		}, /'target' is a required option/);
	});

	it("fails if options.hydrate is true but the component is non-hydratable", async () => {
		const App = await create_component();

		assert.throws(() => {
			new App({
				target: { childNodes: [] },
				hydrate: true
			});
		}, /options.hydrate only works if the component was compiled with the `hydratable: true` option/);
	});
});
