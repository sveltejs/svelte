import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	test({ assert, target, logs }) {
		const [b1, b2] = target.querySelectorAll('button');

		b1.click();
		flushSync();
		assert.deepEqual(logs, ['works']);

		b2.click();
		flushSync();
		assert.deepEqual(logs, ['works', 'works']);
	}
});
