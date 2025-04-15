import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>clicks: 0</button> <button>reset</button>`,

	compileOptions: {
		dev: true
	},

	test({ assert, target, warnings }) {
		const warning =
			'Mutating unbound props (`object`, at Counter.svelte:5:23) is strongly discouraged. Consider using `bind:object={...}` in main.svelte (or using a callback) instead';
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
