import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, logs, target }) {
		assert.deepEqual(logs, ['x', 42]);

		const btn = target.querySelector('button');
		flushSync(() => btn?.click());

		assert.deepEqual(logs, ['x', 42]);
	}
});
