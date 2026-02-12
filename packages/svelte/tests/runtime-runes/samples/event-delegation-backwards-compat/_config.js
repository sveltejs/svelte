import { flushSync } from 'svelte';
import { test } from '../../test';

// Tests backwards compatibility with old Svelte versions that stored delegated
// event handlers as arrays [fn, ...data] instead of plain functions.
// This is important for cross-version web component interop.
// (also see https://github.com/sveltejs/svelte/issues/17057)
export default test({
	test({ assert, target }) {
		const button = target.querySelector('button');
		const p = target.querySelector('p');

		// Simulate old Svelte format: delegated handlers stored as arrays [fn, ...data]
		// This is what older Svelte versions did with "hoisted" event handlers
		let old_handler_called = false;
		const inner_div = document.createElement('div');
		button?.parentElement?.insertBefore(inner_div, button);

		/** @type {any} */ (inner_div).__click = [
			(/** @type {Event} */ event, /** @type {string} */ extra) => {
				old_handler_called = true;
				assert.equal(extra, 'old-data');
			},
			'old-data'
		];

		flushSync(() => {
			inner_div.click();
		});

		assert.equal(old_handler_called, true, 'Old array-format handler should be called');

		// Check that normal delegated handler still works
		flushSync(() => {
			button?.click();
		});

		assert.htmlEqual(p?.innerHTML ?? '', '1');
	}
});
