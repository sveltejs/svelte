import { test } from '../../test';
import { flushSync } from 'svelte';
import { log } from './log.js';

export default test({
	before_test() {
		log.length = 0;
	},

	async test({ assert, target }) {
		log.length = 0;

		const input = /** @type {HTMLInputElement} */ (target.querySelector('input'));
		input.value = '1';
		flushSync(() => input.dispatchEvent(new window.Event('input')));

		assert.deepEqual(log, ['active changed', false, 'active changed', true]);
	}
});
