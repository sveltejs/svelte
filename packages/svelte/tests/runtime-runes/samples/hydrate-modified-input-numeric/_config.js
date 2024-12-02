import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	skip_mode: ['client'],

	test({ assert, target, hydrate }) {
		const input = /** @type {HTMLInputElement} */ (target.querySelector('input'));
		input.value = '1';
		input.dispatchEvent(new window.Event('input'));
		// Hydration shouldn't reset the value to empty
		hydrate();
		flushSync();

		assert.htmlEqual(target.innerHTML, '<input type="number">\n1 (number)');
	}
});
