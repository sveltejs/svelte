import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const [add, add_indexed] = target.querySelectorAll('button');

		for (const [list, button] of /** @type {const} */ ([
			['rows', add],
			['indexed', add_indexed]
		])) {
			/** @param {number} n */
			const input = (n) =>
				/** @type {HTMLInputElement} */ (target.querySelectorAll(`.${list} input`)[n]);
			const text = () =>
				Array.from(target.querySelectorAll(`.${list} p`), (p) =>
					/** @type {string} */ (p.textContent).replace(/\s+/g, ' ').trim()
				);

			input(0).click(); // a: x
			flushSync();

			button.click(); // c is inserted before a
			flushSync();

			input(3).click(); // a: y
			input(0).click(); // c: x
			input(4).click(); // b: x
			flushSync();

			assert.deepEqual(
				text(),
				list === 'rows' ? ['c: x', 'a: x,y', 'b: x'] : ['0 c: x', '1 a: x,y', '2 b: x']
			);
			assert.deepEqual(
				Array.from({ length: 6 }, (_, n) => input(n).checked),
				[true, false, true, true, true, false]
			);
		}
	}
});
