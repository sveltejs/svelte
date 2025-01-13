import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const input = target.querySelector('input');
		flushSync(() => {
			input?.click();
		});
		assert.deepEqual(logs, [0, 1]);
	}
});
