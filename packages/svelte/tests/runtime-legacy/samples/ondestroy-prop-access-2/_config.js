import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target, logs }) {
		const [btn1] = target.querySelectorAll('button');

		flushSync(() => {
			btn1.click();
		});

		assert.deepEqual(logs, ['bar']);
	}
});
