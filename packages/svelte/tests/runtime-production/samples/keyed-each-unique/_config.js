import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		let button = target.querySelector('button');

		button?.click();

		assert.throws(flushSync, 'https://svelte.dev/e/each_key_duplicate');
	}
});
