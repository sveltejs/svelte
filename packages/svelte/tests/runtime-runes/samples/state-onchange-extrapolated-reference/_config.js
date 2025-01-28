import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [btn, btn2, btn3, btn4, btn5, btn6] = target.querySelectorAll('button');
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
		flushSync(() => {
			btn5.click();
		});
		assert.deepEqual(logs, []);
		flushSync(() => {
			btn6.click();
		});
		flushSync(() => {
			btn.click();
		});
		assert.deepEqual(logs, ['arr', 'arr']);
	}
});
