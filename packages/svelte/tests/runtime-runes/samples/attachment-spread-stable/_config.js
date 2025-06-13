import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, logs }) {
		assert.deepEqual(logs, ['up']);

		const button = target.querySelector('button');

		flushSync(() => button?.click());
		assert.deepEqual(logs, ['up']);

		flushSync(() => button?.click());
		assert.deepEqual(logs, ['up', 'down']);
	}
});
