import { flushSync } from 'svelte';
import { test } from '../../test';

// A derived that teardowns re-evaluate (because it depends on reverted values) is only evaluated once,
// in a given teardown and across the teardowns of a batch
export default test({
	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.deepEqual(logs, ['effect: 0', 'teardown: true 0', 'effect: 1', 'other teardown: true']);
	}
});
