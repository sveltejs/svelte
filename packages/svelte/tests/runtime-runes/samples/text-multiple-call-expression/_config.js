import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		assert.deepEqual(logs, ['x', 'y']);

		const [b1, b2] = target.querySelectorAll('button');

		flushSync(() => {
			b1.click();
		});

		flushSync(() => {
			b2.click();
		});

		assert.deepEqual(logs, ['x', 'y', 'x', 'y']);
	}
});
