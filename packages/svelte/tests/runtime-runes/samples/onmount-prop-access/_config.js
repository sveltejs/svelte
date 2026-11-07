import { unmount } from 'svelte';
import { test } from '../../test';

// The `{#key}` branch is detached when the batch that changes `key` commits, so its
// onMount teardown sees `thing` from before that batch's writes (0). The component that
// replaces it sees its own value when it is torn down.
export default test({
	async test({ assert, instance, logs }) {
		assert.deepEqual([...logs], [0]);

		await unmount(instance);
		assert.deepEqual([...logs], [0, 1]);
	}
});
