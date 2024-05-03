import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	// The component context class instance gets shared between tests, strangely, causing hydration to fail?

	async test({ assert, target, logs }) {
		/**
		 * @type {HTMLButtonElement | null}
		 */
		const no_keys_change = target.querySelector('#no-keys-change');
		/**
		 * @type {HTMLButtonElement | null}
		 */
		const keys_change = target.querySelector('#keys-change');
		/**
		 * @type {HTMLButtonElement | null}
		 */
		const no_keys_change_assign = target.querySelector('#no-keys-change-assign');
		/**
		 * @type {HTMLButtonElement | null}
		 */
		const keys_change_assign = target.querySelector('#keys-change-assign');
		/**
		 * @type {HTMLButtonElement | null}
		 */
		const keys_change_override = target.querySelector('#keys-change-override');
		/**
		 * @type {HTMLButtonElement | null}
		 */
		const change_override_assign = target.querySelector('#change-override-assign');

		assert.deepEqual(logs, ['something']);

		flushSync(() => {
			no_keys_change?.click();
		});

		assert.deepEqual(logs, ['something']);

		flushSync(() => {
			keys_change?.click();
		});

		assert.deepEqual(logs, ['something', 'something']);

		flushSync(() => {
			no_keys_change_assign?.click();
		});

		assert.deepEqual(logs, ['something', 'something']);

		flushSync(() => {
			keys_change_assign?.click();
		});

		assert.deepEqual(logs, ['something', 'something', 'something']);

		flushSync(() => {
			keys_change_override?.click();
		});

		assert.deepEqual(logs, ['something', 'something', 'something', 'else']);

		flushSync(() => {
			change_override_assign?.click();
		});

		assert.deepEqual(logs, ['something', 'something', 'something', 'else', 'another']);
	}
});
