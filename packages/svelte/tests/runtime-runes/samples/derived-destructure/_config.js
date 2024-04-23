import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target, logs }) {
		const [b1, b2, b3] = target.querySelectorAll('button');
		logs.length = 0;
		flushSync(() => {
			b1.click();
		});
		assert.deepEqual(logs, ['a', 1]);
		logs.length = 0;
		flushSync(() => {
			b2.click();
		});
		assert.deepEqual(logs, ['b', 1]);
		logs.length = 0;
		flushSync(() => {
			b3.click();
		});
		assert.deepEqual(logs, ['c', 1]);
	}
});
