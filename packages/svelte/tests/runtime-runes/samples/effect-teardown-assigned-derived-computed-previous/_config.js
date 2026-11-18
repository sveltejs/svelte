import { flushSync } from 'svelte';
import { test } from '../../test';

// The value of `d` from before the assignment was computed with `s = 1`, which the teardown reverts,
// so it doesn't hold there — the teardown sees `d` computed with `s = 0` instead
export default test({
	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());
		assert.deepEqual(logs, ['teardown: s=0 d=0']);
	}
});
