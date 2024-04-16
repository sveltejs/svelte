import { flushSync } from 'svelte';
import { test } from '../../test';

/** @type {typeof console.warn} */
let warn;

/** @type {typeof console.trace} */
let trace;

/** @type {any[]} */
let warnings = [];

export default test({
	html: `<button>clicks: 0</button><button>clicks: 0</button>`,

	compileOptions: {
		dev: true
	},

	before_test: () => {
		warn = console.warn;
		trace = console.trace;

		console.warn = (...args) => {
			warnings.push(...args);
		};

		console.trace = () => {};
	},

	after_test: () => {
		console.warn = warn;
		console.trace = trace;

		warnings = [];
	},

	async test({ assert, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		flushSync(() => btn1.click());
		assert.htmlEqual(target.innerHTML, `<button>clicks: 1</button><button>clicks: 0</button>`);

		assert.deepEqual(warnings, []);

		flushSync(() => btn2.click());
		assert.htmlEqual(target.innerHTML, `<button>clicks: 1</button><button>clicks: 1</button>`);

		assert.deepEqual(warnings, [
			'.../samples/non-local-mutation-with-binding-3/Counter.svelte mutated a value owned by .../samples/non-local-mutation-with-binding-3/main.svelte. This is strongly discouraged. Consider passing values to child components with `bind:`, or use a callback instead.'
		]);
	}
});
