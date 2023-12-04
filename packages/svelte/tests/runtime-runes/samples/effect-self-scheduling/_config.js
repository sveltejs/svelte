import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target, component }) {
		const [b1, b2, b3, b4, b5, b6, b7, b8, b9, b10] = target.querySelectorAll('button');

		const p = /** @type {HTMLParagraphElement} */ (target.querySelector('p'));

		assert.htmlEqual(p.innerHTML, `power: 10`);

		flushSync(() => {
			b1.click();
		});

		assert.htmlEqual(p.innerHTML, `power: 10`);

		flushSync(() => {
			b8.click();
		});

		assert.htmlEqual(p.innerHTML, `power: 10`);

		flushSync(() => {
			b9.click();
		});

		assert.htmlEqual(p.innerHTML, `power: 10`);

		flushSync(() => {
			b10.click();
		});

		assert.htmlEqual(p.innerHTML, `power: 10`);
	}
});
