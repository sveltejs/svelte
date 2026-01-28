import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, instance, logs }) {
		const button = target.querySelector('button');
		assert.deepEqual(logs, ['effect', 1]);
		flushSync(() => {
			button?.click();
		});
		assert.deepEqual(logs, ['effect', 1, 'clean', 1, 'effect', 2]);
	}
});
