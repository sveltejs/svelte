import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target }) {
		/** @param {HTMLSelectElement} select @param {boolean[]} expected */
		function check(select, expected) {
			assert.deepEqual(
				[...select.options].map((option) => option.selected),
				expected
			);
		}

		/** @param {HTMLSelectElement} select @param {number[]} indexes */
		function select(select, indexes) {
			for (let i = 0; i < select.options.length; i++) {
				select.options[i].selected = indexes.includes(i);
			}
			select.dispatchEvent(new Event('change', { bubbles: true }));
		}

		const selects = target.querySelectorAll('select');
		const reset = /** @type {HTMLInputElement} */ (target.querySelector('input[type=reset]'));
		/** @param {string} name */
		const button = (name) => /** @type {HTMLButtonElement} */ (target.querySelector(`.${name}`));

		check(selects[0], [false, true, false]);
		check(selects[1], [false, false, true]);
		check(selects[2], [false, true, false]);
		check(selects[3], [true]);
		check(selects[4], [false, true]);
		check(selects[5], [false, true, false]);
		check(selects[6], [true, false]);
		check(selects[7], [true, false, true]);
		check(selects[8], [false, false, true]);

		select(selects[0], [2]);
		select(selects[1], [0]);
		select(selects[5], [2]);
		select(selects[7], [1]);
		flushSync();

		reset.click();
		await Promise.resolve();
		flushSync();
		check(selects[0], [false, true, false]);
		check(selects[1], [false, true, false]);
		check(selects[5], [false, true, false]);
		check(selects[7], [true, false, true]);

		select(selects[2], [2]);
		select(selects[5], [2]);
		button('update').click();
		flushSync();
		check(selects[2], [false, false, true]);
		check(selects[5], [false, false, true]);
		assert.deepEqual(
			[...selects[5].options].map((option) => option.defaultSelected),
			[true, false, false]
		);

		button('add').click();
		flushSync();
		await Promise.resolve();
		check(selects[3], [true, false]);
		assert.equal(selects[3].options[1].defaultSelected, true);

		reset.click();
		await Promise.resolve();
		flushSync();
		check(selects[0], [true, false, false]);
		check(selects[2], [true, false, false]);
		check(selects[3], [false, true]);
		check(selects[5], [true, false, false]);

		select(selects[5], [2]);
		select(selects[7], [1]);
		button('remove').click();
		button('clear').click();
		flushSync();
		assert.equal(
			[...selects[5].options].some((option) => option.defaultSelected),
			false
		);
		assert.equal(
			[...selects[7].options].some((option) => option.defaultSelected),
			false
		);

		reset.click();
		await Promise.resolve();
		flushSync();
		check(selects[5], [true, false, false]);
		check(selects[7], [false, false, false]);
	}
});
