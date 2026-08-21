import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	mode: ['client'],
	async test({ target, assert, logs }) {
		const button = target.querySelector('button');

		button?.click();
		flushSync();
		button?.click();
		flushSync();
		button?.click();
		flushSync();
		button?.click();
		flushSync();

		assert.deepEqual(logs, ['two', 'one', 'two', 'one', 'two']);
	}
});
