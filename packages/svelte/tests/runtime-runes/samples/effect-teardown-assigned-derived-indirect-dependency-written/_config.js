import { flushSync } from 'svelte';
import { test } from '../../test';

// An intermediate derived may have a newer global value, but teardown validity
// must follow its dependencies in the reverted view, including subsequent writes.
export default test({
	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.deepEqual(
			[...logs],
			['current: 4', 'before dependency write: 10', 'after dependency write: 8']
		);
	}
});
