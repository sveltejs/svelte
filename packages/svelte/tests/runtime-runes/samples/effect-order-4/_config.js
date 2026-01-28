import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target, logs }) {
		const [b1] = target.querySelectorAll('button');
		flushSync(() => {
			b1.click();
		});
		flushSync(() => {
			b1.click();
		});
		assert.deepEqual(logs, [
			{ count: 0, doubled: 0 },
			{ count: 1, doubled: 2 },
			{ count: 2, doubled: 4 }
		]);
	}
});
