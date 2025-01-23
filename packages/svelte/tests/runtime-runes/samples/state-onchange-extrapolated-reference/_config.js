import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [btn, btn2, btn3, btn4] = target.querySelectorAll('button');
		logs.length = 0;

		flushSync(() => {
			btn.click();
		});
		flushSync(() => {
			btn2.click();
		});
		flushSync(() => {
			btn3.click();
		});
		flushSync(() => {
			btn4.click();
		});
		assert.deepEqual(logs, []);
	}
});
