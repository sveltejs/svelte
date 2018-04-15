import assert from "assert";
import { svelte, deindent, env, setupHtmlEqual } from "../helpers.js";

function testAmd(code, expectedId, dependencies, html) {
	const fn = new Function("define", code);
	const window = env();

	function define(id, deps, factory) {
		assert.equal(id, expectedId);
		assert.deepEqual(deps, Object.keys(dependencies));

		const SvelteComponent = factory(
			...Object.keys(dependencies).map(key => dependencies[key])
		);

		const main = window.document.body.querySelector("main");
		const component = new SvelteComponent({ target: main });

		assert.htmlEqual(main.innerHTML, html);

		component.destroy();
	}

	define.amd = true;

	fn(define);
}

function testCjs(code, dependencyById, html) {
	const fn = new Function("module", "exports", "require", code);
	const window = env();

	const module = { exports: {} };
	const require = id => {
		return dependencyById[id];
	};

	fn(module, module.exports, require);

	const SvelteComponent = module.exports;

	const main = window.document.body.querySelector("main");
	const component = new SvelteComponent({ target: main });

	assert.htmlEqual(main.innerHTML, html);

	component.destroy();
}

function testIife(code, name, globals, html) {
	const fn = new Function(Object.keys(globals), `${code}\n\nreturn ${name};`);
	const window = env();

	const SvelteComponent = fn(
		...Object.keys(globals).map(key => globals[key])
	);

	const main = window.document.body.querySelector("main");
	const component = new SvelteComponent({ target: main });

	assert.htmlEqual(main.innerHTML, html);

	component.destroy();
}

function testEval(code, name, globals, html) {
	const fn = new Function(Object.keys(globals), `return ${code};`);
	const window = env();

	const SvelteComponent = fn(
		...Object.keys(globals).map(key => globals[key])
	);

	const main = window.document.body.querySelector("main");
	const component = new SvelteComponent({ target: main });

	assert.htmlEqual(main.innerHTML, html);

	component.destroy();
}

describe("formats", () => {
	before(setupHtmlEqual);

	describe("amd", () => {
		it("generates an AMD module", () => {
			const source = deindent`
				<div>{{answer}}</div>

				<script>
					import answer from 'answer';

					export default {
						data () {
							return { answer };
						}
					};
				</script>
			`;

			const { js } = svelte.compile(source, {
				format: "amd",
				amd: { id: "foo" }
			});

			return testAmd(js.code, "foo", { answer: 42 }, `<div>42</div>`);
		});
	});

	describe("cjs", () => {
		it("generates a CommonJS module", () => {
			const source = deindent`
				<div>{{answer}}</div>

				<script>
					import answer from 'answer';

					export default {
						data () {
							return { answer };
						}
					};
				</script>
			`;

			const { js } = svelte.compile(source, {
				format: "cjs"
			});

			return testCjs(js.code, { answer: 42 }, `<div>42</div>`);
		});
	});

	describe("iife", () => {
		it("generates a self-executing script", () => {
			const source = deindent`
				<div>{{answer}}</div>

				<script>
					import answer from 'answer';

					export default {
						data () {
							return { answer };
						}
					};
				</script>
			`;

			const { js } = svelte.compile(source, {
				format: "iife",
				name: "Foo",
				globals: {
					answer: "answer"
				}
			});

			return testIife(js.code, "Foo", { answer: 42 }, `<div>42</div>`);
		});

		it('requires options.name', () => {
			assert.throws(() => {
				svelte.compile('', {
					format: 'iife'
				});
			}, /Missing required 'name' option for IIFE export/);
		});

		it('suggests using options.globals for default imports', () => {
			const warnings = [];

			svelte.compile(`
				<script>
					import _ from 'lodash';
				</script>
			`,
				{
					format: 'iife',
					name: 'App',
					onwarn: warning => {
						warnings.push(warning);
					}
				}
			);

			assert.deepEqual(warnings, [{
				code: `options-missing-globals`,
				message: `No name was supplied for imported module 'lodash'. Guessing '_', but you should use options.globals`
			}]);
		});

		it('insists on options.globals for named imports', () => {
			assert.throws(() => {
				svelte.compile(`
					<script>
						import { fade } from 'svelte-transitions';
					</script>
				`,
					{
						format: 'iife',
						name: 'App'
					}
				);
			}, /Could not determine name for imported module 'svelte-transitions' – use options.globals/);
		});
	});

	describe("umd", () => {
		it("generates a UMD build", () => {
			const source = deindent`
				<div>{{answer}}</div>

				<script>
					import answer from 'answer';

					export default {
						data () {
							return { answer };
						}
					};
				</script>
			`;

			const { js } = svelte.compile(source, {
				format: "umd",
				name: "Foo",
				globals: {
					answer: "answer"
				},
				amd: {
					id: "foo"
				}
			});

			testAmd(js.code, "foo", { answer: 42 }, `<div>42</div>`);
			testCjs(js.code, { answer: 42 }, `<div>42</div>`);
			testIife(js.code, "Foo", { answer: 42 }, `<div>42</div>`);
		});

		it('requires options.name', () => {
			assert.throws(() => {
				svelte.compile('', {
					format: 'umd'
				});
			}, /Missing required 'name' option for UMD export/);
		});
	});

	describe("eval", () => {
		it("generates a self-executing script that returns the component on eval", () => {
			const source = deindent`
				<div>{{answer}}</div>

				<script>
					import answer from 'answer';

					export default {
						data () {
							return { answer };
						}
					};
				</script>
			`;

			const { js } = svelte.compile(source, {
				format: "eval",
				globals: {
					answer: "answer"
				}
			});

			return testEval(js.code, "Foo", { answer: 42 }, `<div>42</div>`);
		});
	});

	describe('unknown format', () => {
		it('throws an error', () => {
			assert.throws(() => {
				svelte.compile('', {
					format: 'nope'
				});
			}, /options.format is invalid \(must be es, amd, cjs, iife, umd or eval\)/);
		});
	});
});
