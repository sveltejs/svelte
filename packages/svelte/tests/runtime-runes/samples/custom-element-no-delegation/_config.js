import { tick } from 'svelte';
import { test } from '../../test';

// Tests that custom element builds don't use event delegation, and that
// events still work correctly on both the inner button and the outer custom element.
// This prevents cross-version conflicts across shadow DOM boundaries (https://github.com/sveltejs/svelte/issues/17057).
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();

		const my_button = target.querySelector('my-button');
		const button = my_button?.shadowRoot?.querySelector('button');
		const p = target.querySelector('p');

		assert.ok(button, 'Button should exist inside shadow DOM');

		// Verify the inner button does NOT use event delegation (__click property)
		// because it's compiled as part of a custom element
		assert.equal(
			/** @type {any} */ (button)?.__click,
			undefined,
			'Custom element internals should not use event delegation'
		);

		button?.click();
		await tick();

		assert.include(button?.textContent, 'clicks: 1');

		// The outer onclick should also fire due to event propagation
		assert.htmlEqual(p?.innerHTML ?? '', 'outer: 1');
	}
});
