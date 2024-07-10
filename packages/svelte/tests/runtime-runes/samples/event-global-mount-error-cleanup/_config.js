import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	test({ assert, target, logs }) {
		target.click();
		flushSync();
		assert.deepEqual(logs, []);
	}
});
