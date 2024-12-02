import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, warnings }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		flushSync(() => {
			btn1.click();
		});

		assert.deepEqual(warnings.length, 0);

		flushSync(() => {
			btn2.click();
		});

		assert.deepEqual(warnings.length, 1);
	}
});
