import { flushSync } from 'svelte';
import { test } from '../../test';

// Expiring an intermediate assignment must invalidate the outer assignment only
// if recomputing that intermediate changes its value.
export default test({
	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.deepEqual([...logs], ['before: 100 200', 'after: 8 200']);
	}
});
