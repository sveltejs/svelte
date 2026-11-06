import { flushSync } from 'svelte';
import { test } from '../../test';

// `double` is not read between the event's write and the teardown, so its global
// version is still old even though computing it in the teardown produces a new value.
export default test({
	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.deepEqual([...logs], ['before dependency write: 10', 'after dependency write: 8']);
	}
});
