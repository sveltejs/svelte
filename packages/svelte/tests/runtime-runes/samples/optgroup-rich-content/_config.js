import { flushSync } from 'svelte';
import { test } from '../../test';

// Test that optgroup with rich HTML content (non-option elements) and dynamic expressions works correctly
export default test({
	mode: ['client', 'hydrate'],
	test({ assert, target }) {
		const select = /** @type {HTMLSelectElement} */ (target.querySelector('select'));
		const optgroups = target.querySelectorAll('optgroup');
		const options = target.querySelectorAll('option');
		const button = /** @type {HTMLButtonElement} */ (target.querySelector('button'));

		assert.ok(select);
		assert.equal(optgroups.length, 2);
		assert.equal(options.length, 4);

		// Check initial option content (rich content inside optgroup)
		assert.equal(options[0]?.textContent, 'apple apple');
		assert.equal(options[1]?.textContent, 'banana');
		assert.equal(options[2]?.textContent, 'carrot carrot');
		assert.equal(options[3]?.textContent, 'Plain celery');

		// Click button to change dynamic content
		button.click();
		flushSync();

		// Check updated option content
		assert.equal(options[0]?.textContent, 'orange orange');
		assert.equal(options[2]?.textContent, 'broccoli broccoli');
	}
});
