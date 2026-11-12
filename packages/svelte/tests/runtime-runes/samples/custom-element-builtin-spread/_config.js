import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	test({ assert, target }) {
		const [plain, spread, clear] = target.querySelectorAll('button');
		const select = /** @type {HTMLSelectElement} */ (target.querySelector('select'));
		const p = /** @type {HTMLParagraphElement} */ (target.querySelector('p'));

		assert.equal(plain.textContent, 'one');
		assert.equal(spread.textContent, 'one');
		assert.equal(spread.hasAttribute('label'), false);

		clear.click();
		flushSync();
		assert.equal(plain.textContent, 'null');
		assert.equal(spread.textContent, 'null');

		select.selectedIndex = 1;
		select.dispatchEvent(new Event('change'));
		flushSync();
		assert.equal(p.textContent, 'b');
	}
});
