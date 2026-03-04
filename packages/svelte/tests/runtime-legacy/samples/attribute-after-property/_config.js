import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ target, assert }) {
		const input = target.querySelector('input');
		const button = target.querySelector('button');

		assert.equal(input?.step, 'any');

		button?.click();
		flushSync();
		assert.equal(input?.step, '10');

		button?.click();
		flushSync();
		assert.equal(input?.step, 'any');
	}
});
