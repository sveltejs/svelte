import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	mode: ['client'],
	async test({ target, assert }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());

		assert.equal(target.textContent?.trim(), 'Trigger');
	}
});
