import assert from "assert";
import chalk from 'chalk';
import * as path from "path";
import * as fs from "fs";
import * as acorn from "acorn";
import { transitionManager } from "../../shared.js";

import {
	showOutput,
	loadConfig,
	loadSvelte,
	env,
	setupHtmlEqual,
	spaces
} from "../helpers.js";

let svelte$;
let svelte;

let compileOptions = null;
let compile = null;

function getName(filename) {
	const base = path.basename(filename).replace(".html", "");
	return base[0].toUpperCase() + base.slice(1);
}

describe("runtime", () => {
	before(() => {
		svelte = loadSvelte(false);
		svelte$ = loadSvelte(true);

		require.extensions[".html"] = function(module, filename) {
			const options = Object.assign(
				{ filename, name: getName(filename), format: 'cjs' },
				compileOptions
			);

			const { code } = compile(fs.readFileSync(filename, "utf-8"), options);

			return module._compile(code, filename);
		};

		return setupHtmlEqual();
	});

	const failed = new Set();

	function runTest(dir, shared, hydrate) {
		if (dir[0] === ".") return;

		const config = loadConfig(`./runtime/samples/${dir}/_config.js`);

		if (config.solo && process.env.CI) {
			throw new Error("Forgot to remove `solo: true` from test");
		}

		(config.skip ? it.skip : config.solo ? it.only : it)(`${dir} (${shared ? 'shared' : 'inline'} helpers${hydrate ? ' , hydration' : ''})`, () => {
			if (failed.has(dir)) {
				// this makes debugging easier, by only printing compiled output once
				throw new Error('skipping test, already failed');
			}

			compile = (config.preserveIdentifiers ? svelte : svelte$).compile;

			const cwd = path.resolve(`test/runtime/samples/${dir}`);
			global.document.title = '';

			compileOptions = config.compileOptions || {};
			compileOptions.shared = shared;
			compileOptions.hydratable = hydrate;
			compileOptions.dev = config.dev;
			compileOptions.store = !!config.store;
			compileOptions.immutable = config.immutable;

			// check that no ES2015+ syntax slipped in
			if (!config.allowES2015) {
				try {
					const source = fs.readFileSync(
						`test/runtime/samples/${dir}/main.html`,
						"utf-8"
					);
					const { code } = compile(source, compileOptions);
					const startIndex = code.indexOf("function create_main_fragment"); // may change!
					if (startIndex === -1) throw new Error("missing create_main_fragment");
					const endIndex = code.lastIndexOf("export default");
					const es5 =
						code.slice(0, startIndex).split('\n').map(x => spaces(x.length)).join('\n') +
						code.slice(startIndex, endIndex);

					acorn.parse(es5, { ecmaVersion: 5 });

					if (/Object\.assign/.test(es5)) {
						throw new Error(
							"cannot use Object.assign in generated code, as it is not supported everywhere"
						);
					}
				} catch (err) {
					failed.add(dir);
					if (err.frame) {
						console.error(chalk.red(err.frame)); // eslint-disable-line no-console
					}
					showOutput(cwd, { shared, format: 'cjs', store: !!compileOptions.store }, compile); // eslint-disable-line no-console
					throw err;
				}
			}

			Object.keys(require.cache)
				.filter(x => x.endsWith(".html"))
				.forEach(file => {
					delete require.cache[file];
				});

			let SvelteComponent;

			let unintendedError = null;

			const window = env();

			return Promise.resolve()
				.then(() => {
					// set of hacks to support transition tests
					transitionManager.running = false;
					transitionManager.transitions = [];

					const raf = {
						time: 0,
						callback: null,
						tick: now => {
							raf.time = now;
							if (raf.callback) raf.callback();
						}
					};
					window.performance.now = () => raf.time;
					global.requestAnimationFrame = cb => {
						let called = false;
						raf.callback = () => {
							if (!called) {
								called = true;
								cb();
							}
						};
					};

					try {
						SvelteComponent = require(`./samples/${dir}/main.html`);
					} catch (err) {
						showOutput(cwd, { shared, format: 'cjs', hydratable: hydrate, store: !!compileOptions.store }, compile); // eslint-disable-line no-console
						throw err;
					}

					global.window = window;

					// Put the constructor on window for testing
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
						data: config.data,
						store: (config.store !== true && config.store)
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
						return Promise.resolve(config.test(assert, component, target, window, raf)).then(() => {
							component.destroy();
						});
					} else {
						component.destroy();
						assert.equal(target.innerHTML, "");
					}
				})
				.catch(err => {
					if (config.error && !unintendedError) {
						config.error(assert, err);
					} else {
						failed.add(dir);
						showOutput(cwd, { shared, format: 'cjs', hydratable: hydrate, store: !!compileOptions.store }, compile); // eslint-disable-line no-console
						throw err;
					}
				})
				.then(() => {
					if (config.show) showOutput(cwd, { shared, format: 'cjs', hydratable: hydrate, store: !!compileOptions.store }, compile);
				});
		});
	}

	const shared = path.resolve("shared.js");
	fs.readdirSync("test/runtime/samples").forEach(dir => {
		runTest(dir, shared, false);
		runTest(dir, shared, true);
		runTest(dir, null, false);
	});

	it("fails if options.target is missing in dev mode", () => {
		const { code } = svelte$.compile(`<div></div>`, {
			format: "iife",
			name: "SvelteComponent",
			dev: true
		});

		const SvelteComponent = eval(
			`(function () { ${code}; return SvelteComponent; }())`
		);

		assert.throws(() => {
			new SvelteComponent();
		}, /'target' is a required option/);
	});

	it("fails if options.hydrate is true but the component is non-hydratable", () => {
		const { code } = svelte$.compile(`<div></div>`, {
			format: "iife",
			name: "SvelteComponent",
			dev: true
		});

		const SvelteComponent = eval(
			`(function () { ${code}; return SvelteComponent; }())`
		);

		assert.throws(() => {
			new SvelteComponent({
				target: {},
				hydrate: true
			});
		}, /options.hydrate only works if the component was compiled with the `hydratable: true` option/);
	});
});
