import { flushSync } from 'svelte';
import { test } from '../../test';

/** @type {typeof console.trace} */
let trace;

export default test({
	html: `<button>clicks: 0</button><button>clicks: 0</button>`,

	compileOptions: {
		dev: true
	},

	before_test: () => {
		trace = console.trace;

		console.trace = () => {};
	},

	after_test: () => {
		console.trace = trace;
	},

	async test({ assert, target, warnings }) {
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
