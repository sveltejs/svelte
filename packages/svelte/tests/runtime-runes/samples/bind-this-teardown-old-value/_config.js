import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, logs }) {
		target.querySelector('button')?.click();
		flushSync();

		assert.deepEqual(logs, ['INPUT']);
	}
});
