import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, logs }) {
		assert.deepEqual(logs, ['rendering']);

		const btn = target.querySelector('button');
		flushSync(() => btn?.click());

		assert.deepEqual(logs, ['rendering']);
	}
});
