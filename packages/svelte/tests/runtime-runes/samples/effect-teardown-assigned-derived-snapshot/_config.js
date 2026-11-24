import { flushSync } from 'svelte';
import { test } from '../../test';

// `double` was assigned before the update, but is computed again before flushing.
// Writing unrelated state in a teardown must not lose its previous assigned value.
export default test({
	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.deepEqual(
			[...logs],
			['current: 2', 'before unrelated write: 10', 'after unrelated write: 10']
		);
	}
});
