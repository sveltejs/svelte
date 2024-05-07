import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],
	async test({ target, assert, logs }) {
		/**
		 * @type {HTMLButtonElement | null}
		 */
		const increment = target.querySelector('#increment');
		/**
		 * @type {HTMLButtonElement | null}
		 */
		const decrement = target.querySelector('#decrement');
		/**
		 * @type {HTMLButtonElement | null}
		 */
		const increment_before = target.querySelector('#increment_before');
		/**
		 * @type {HTMLButtonElement | null}
		 */
		const decrement_before = target.querySelector('#decrement_before');

		increment?.click();
		await Promise.resolve();
		assert.equal(increment?.innerHTML.trim(), '1');
		increment_before?.click();
		await Promise.resolve();
		assert.equal(increment_before?.innerHTML.trim(), '1');
		decrement?.click();
		await Promise.resolve();
		assert.equal(decrement?.innerHTML.trim(), '-1');
		decrement_before?.click();
		await Promise.resolve();
		assert.equal(decrement_before?.innerHTML.trim(), '-1');

		assert.deepEqual(logs, ['0', 1, '0', -1]);
	}
});
