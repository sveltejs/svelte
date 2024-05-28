import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [b1] = target.querySelectorAll('button');
		b1.click();
		flushSync();

		assert.deepEqual(logs, ['works']);
	}
});
