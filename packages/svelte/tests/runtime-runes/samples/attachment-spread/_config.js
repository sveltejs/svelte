import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, logs, target }) {
		assert.deepEqual(logs, ['hello']);
	}
});
