import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, logs }) {
		const [b1, b2] = target.querySelectorAll('button');
		b1.click();
		b2.click();
		flushSync();

		assert.deepEqual(logs, [0, 1]);
	}
});
