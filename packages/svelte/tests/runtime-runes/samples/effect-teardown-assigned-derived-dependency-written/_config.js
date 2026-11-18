import { flushSync } from 'svelte';
import { test } from '../../test';

// A restored assignment still expires when a teardown writes one of its dependencies.
export default test({
	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.deepEqual(
			[...logs],
			['current: 2', 'before dependency write: 10', 'after dependency write: 4']
		);
	}
});
