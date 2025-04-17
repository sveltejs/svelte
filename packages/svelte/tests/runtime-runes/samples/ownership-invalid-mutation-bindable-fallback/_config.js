import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: {
		dev: true
	},
	async test({ warnings, assert, target }) {
		const [btn, btn2] = target.querySelectorAll('button');
		flushSync(() => {
			btn2.click();
		});
		assert.deepEqual(warnings, []);
		flushSync(() => {
			btn.click();
		});
		flushSync(() => {
			btn2.click();
		});
		assert.deepEqual(warnings, []);
	}
});
