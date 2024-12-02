import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	test({ assert, logs, target }) {
		const btn = target.querySelector('button');

		btn?.click();
		flushSync();

		assert.deepEqual(logs, [1, 1]);
	}
});
