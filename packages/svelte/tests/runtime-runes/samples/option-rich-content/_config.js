import { flushSync } from 'svelte';
import { test } from '../../test';

// Test that rich HTML content in <option> elements compiles without errors
// and that the component functions correctly (on browsers that support it)
export default test({
	mode: ['client'],
	test({ assert, target }) {
		const select = /** @type {HTMLSelectElement} */ (target.querySelector('select'));
		const p = /** @type {HTMLParagraphElement} */ (target.querySelector('p'));
		const button = /** @type {HTMLButtonElement} */ (target.querySelector('button'));

		assert.ok(select);
		assert.ok(p);
		assert.ok(button);
		assert.equal(select.value, 'a');
		assert.equal(p.textContent, 'Selected: a');

		// Verify options exist
		assert.equal(select.options.length, 3);

		// Change selection
		select.value = 'b';
		select.dispatchEvent(new Event('change'));
		flushSync();

		assert.equal(p.textContent, 'Selected: b');

		// Test reactivity of content within option (only works on browsers that support rich options)
		// On modern browsers, clicking the button should update the text inside the span
		button.click();
		flushSync();

		// The option text content should be updated on browsers that support rich options
		// For this test, we just verify the component doesn't crash
	}
});
