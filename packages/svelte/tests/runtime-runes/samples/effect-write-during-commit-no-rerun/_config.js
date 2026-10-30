import { flushSync } from 'svelte';
import { test } from '../../test';

// A write made by an effect while a batch commits goes to a new batch. An effect that runs after it in the
// same commit sees the write already, so it doesn't run again when the new batch is processed
export default test({
	test({ assert, target, logs }) {
		logs.length = 0;
		flushSync(() => target.querySelector('button')?.click());
		assert.deepEqual(logs, ['x 2']);
	}
});
