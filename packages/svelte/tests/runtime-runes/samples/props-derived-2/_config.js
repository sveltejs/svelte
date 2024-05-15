import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target, logs }) {
		logs.length = 0;

		const input = /** @type {HTMLInputElement} */ (target.querySelector('input'));
		input.value = '1';
		flushSync(() => input.dispatchEvent(new window.Event('input')));

		assert.deepEqual(logs, ['active changed', false, 'active changed', true]);
	}
});
