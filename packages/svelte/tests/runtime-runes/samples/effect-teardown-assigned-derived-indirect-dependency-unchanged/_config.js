import { flushSync } from 'svelte';
import { test } from '../../test';

// A dependency write that leaves the intermediate derived unchanged must not
// discard the restored assignment of the outer derived.
export default test({
	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.deepEqual(
			[...logs],
			['current: 20', 'before dependency write: 10', 'after dependency write: 10']
		);
	}
});
