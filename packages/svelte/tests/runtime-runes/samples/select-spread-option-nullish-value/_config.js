import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const select = /** @type {HTMLSelectElement} */ (target.querySelector('select'));
		const p = /** @type {HTMLParagraphElement} */ (target.querySelector('p'));

		select.selectedIndex = 1;
		select.dispatchEvent(new Event('change'));
		flushSync();
		assert.equal(p.textContent, 'undefined undefined');

		select.selectedIndex = 2;
		select.dispatchEvent(new Event('change'));
		flushSync();
		assert.equal(p.textContent, 'object null');
	}
});
