import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, logs }) {
		const btn = target.querySelector('button');
		btn?.click();
		flushSync();

		assert.deepEqual(logs, ['works!']);
	}
});
