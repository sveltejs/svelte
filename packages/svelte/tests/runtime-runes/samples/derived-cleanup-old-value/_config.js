import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, logs, target }) {
		/** @type {HTMLButtonElement | null} */
		const increment_btn = target.querySelector('#increment');
		/** @type {HTMLButtonElement | null} */
		const overwrite_btn = target.querySelector('#overwrite');

		// Initial state: count=1, derived_value=1

		// Click to increment count: count=2, derived_value=4
		flushSync(() => {
			increment_btn?.click();
		});

		// Click to increment count: count=3, derived_value=9
		flushSync(() => {
			increment_btn?.click();
		});

		// Click to overwrite derived_value: count=3, derived_value=7
		flushSync(() => {
			overwrite_btn?.click();
		});

		// Should log old value during cleanup (4) and new value during setup (9)
		assert.deepEqual(logs, [
			'$effect: 1',
			'$effect teardown: 1',
			'$effect: 4',
			'$effect teardown: 4',
			'$effect: 9',
			'$effect teardown: 9',
			'$effect: 7'
		]);
	}
});
