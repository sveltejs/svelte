import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	skip_no_async: true,
	async test({ assert, target, logs }) {
		const fork = target.querySelector('button');

		flushSync(() => {
			fork?.click();
		});

		assert.deepEqual(logs, [1]);
	}
});
