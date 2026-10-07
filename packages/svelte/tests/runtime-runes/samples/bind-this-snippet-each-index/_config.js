import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],

	test({ assert, target }) {
		const button = /** @type {HTMLButtonElement} */ (target.querySelector('button'));
		const p = /** @type {HTMLParagraphElement} */ (target.querySelector('p'));

		flushSync();
		assert.equal(p.textContent, 'a,b,c | a,b,c | a,b,c');

		button.click();
		flushSync();

		assert.equal(p.textContent, 'a,c,null | a,c,null | a,c,null');
	}
});
