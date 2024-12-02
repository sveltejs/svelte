import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: {
		dev: true
	},
	async test({ warnings, assert, target }) {
		const [btn1, btn2, btn3, btn4] = target.querySelectorAll('button');
		flushSync(() => {
			btn1.click();
			btn2.click();
			btn3.click();
			btn4.click();
		});
		assert.deepEqual(warnings, []);
	}
});
