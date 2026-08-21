import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	accessors: false,
	test({ assert, logs, target }) {
		assert.deepEqual(logs, ['primitive', 'object']);
		target.querySelector('button')?.click();
		flushSync();
		assert.deepEqual(logs, ['primitive', 'object', 'object']);
	}
});
