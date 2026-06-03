import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	// This test verifies that hydration works correctly for
	// optgroup elements with rich HTML content (non-option elements inside optgroup)
	snapshot(target) {
		const select = target.querySelector('select');

		return {
			select
		};
	},

	async test(assert, target) {
		const optgroup = target.querySelector('optgroup');
		const options = target.querySelectorAll('option');
		const button = target.querySelector('button');

		// Check options content - the span inside optgroup gets stripped but text remains
		assert.equal(options[0]?.textContent, 'hello hello');
		assert.equal(options[1]?.textContent, 'Plain option');

		// Update via button click
		flushSync(() => {
			button?.click();
		});

		assert.equal(options[0]?.textContent, 'changed changed');
	}
});
