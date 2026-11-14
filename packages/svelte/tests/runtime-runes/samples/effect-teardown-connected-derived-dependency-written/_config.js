import { flushSync } from 'svelte';
import { test } from '../../test';

// A derived that a teardown evaluates with a reverted value (and caches) reflects what it writes afterwards,
// even if the derived is connected (i.e. writing marks it dirty)
export default test({
	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.deepEqual(logs, [
			{ a: 0, b: 0 },
			{ a: 5, b: 25 }
		]);
	}
});
