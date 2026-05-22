import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const btn = target.querySelector('button');

		flushSync(() => {
			btn?.click();
		});

		flushSync(() => {
			btn?.click();
		});

		assert.deepEqual(logs, [
			{},
			{ 0: { name: 'Row 0' } },
			{ 0: { name: 'Row 0' }, 1: { name: 'Row 1' } }
		]);
	}
});
