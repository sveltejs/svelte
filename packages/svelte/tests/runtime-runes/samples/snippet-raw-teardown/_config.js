import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ target, assert, logs }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());
		assert.deepEqual(logs, ['tearing down']);
	}
});
