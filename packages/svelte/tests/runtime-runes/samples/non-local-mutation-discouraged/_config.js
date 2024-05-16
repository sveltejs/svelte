import { test } from '../../test';

/** @type {typeof console.trace} */
let trace;

export default test({
	html: `<button>clicks: 0</button>`,

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
		const btn = target.querySelector('button');
		await btn?.click();

		assert.htmlEqual(target.innerHTML, `<button>clicks: 1</button>`);

		assert.deepEqual(warnings, [
			'Counter.svelte mutated a value owned by main.svelte. This is strongly discouraged. Consider passing values to child components with `bind:`, or use a callback instead'
		]);
	}
});
