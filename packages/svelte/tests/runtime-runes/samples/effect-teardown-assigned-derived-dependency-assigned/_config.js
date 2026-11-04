import { flushSync } from 'svelte';
import { test } from '../../test';

// Assigning the intermediate derived invalidates the outer assignment even
// though none of the intermediate derived's own dependencies has changed.
export default test({
	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.deepEqual(
			[...logs],
			['before dependency assignment: 10', 'after dependency assignment: 14']
		);
	}
});
