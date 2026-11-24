import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	// Test that $effect/onMount etc at the top level of components are correctly deferred/coordinated if inside an async block
	async test({ assert, logs }) {
		await tick();
		assert.deepEqual(logs, [true]);
	}
});
