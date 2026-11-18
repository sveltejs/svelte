import { flushSync } from 'svelte';
import { test } from '../../test';

// Like `error-boundary-19`, but the derived is only MAYBE_DIRTY when it throws (it reads another
// derived), so the second reader must not take its previous value for the current one
export default test({
	test({ assert, target, logs }) {
		const btn = target.querySelector('button');

		btn?.click();
		btn?.click();
		flushSync();

		assert.deepEqual(logs, ['error caught 1', 'error caught 2']);
	}
});
