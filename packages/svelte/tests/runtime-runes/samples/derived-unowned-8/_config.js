import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		let [btn1] = target.querySelectorAll('button');

		flushSync(() => {
			btn1.click();
		});

		flushSync(() => {
			btn1.click();
		});

		flushSync(() => {
			btn1.click();
		});

		assert.deepEqual(logs, ['recalculating']);
	}
});
