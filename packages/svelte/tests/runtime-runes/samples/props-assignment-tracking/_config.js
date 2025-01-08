import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, logs, target }) {
		const btn = target.querySelector('button');

		flushSync(() => {
			btn?.click();
			btn?.click();
			btn?.click();
		});

		assert.deepEqual(logs, ['effect']);
	}
});
