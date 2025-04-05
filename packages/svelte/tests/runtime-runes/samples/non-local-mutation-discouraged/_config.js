import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>clicks: 0</button> <button>reset</button>`,

	compileOptions: {
		dev: true
	},

	test({ assert, target, warnings }) {
		const warning =
			'Counter.svelte mutated property `object` from parent component main.svelte, which did not declare it as a binding. This is strongly discouraged. Consider passing props to child components that mutate them with `bind:` (e.g. `bind:object={...}` instead of `object={...}`), or use a callback instead';
		const [btn1, btn2] = target.querySelectorAll('button');

		btn1.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>clicks: 1</button> <button>reset</button>`);
		assert.deepEqual(warnings, [warning]);

		btn2.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>clicks: 0</button> <button>reset</button>`);

		btn1.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>clicks: 1</button> <button>reset</button>`);
		assert.deepEqual(warnings, [warning, warning]);
	}
});
