import { flushSync } from 'svelte';
import { test } from '../../test';

// A teardown that writes the value a source or derived already has globally
// sees that value afterwards, rather than the reverted one
export default test({
	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.deepEqual(logs, ['before: 0 10', 'after: 1 20']);
	}
});
