import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const add = /** @type {HTMLButtonElement} */ (target.querySelector('#add'));
		const shift = /** @type {HTMLButtonElement} */ (target.querySelector('#shift'));

		// resolve initial pending state
		shift.click();
		await tick();

		const select = /** @type {HTMLSelectElement} */ (target.querySelector('select'));
		assert.equal(select.value, 'a');

		// add option 'c', making items ['a', 'b', 'c']
		add.click();
		await tick();

		// select 'b' while focused
		select.focus();
		select.value = 'b';
		select.dispatchEvent(new InputEvent('change', { bubbles: true }));
		await tick();

		// the select should still show 'b'
		assert.equal(select.value, 'b');

		// add option 'd', making items ['a', 'b', 'c', 'd']
		// this triggers MutationObserver which uses select.__value
		add.click();
		await tick();

		// select should still show 'b', not snap to a stale value
		assert.equal(select.value, 'b');
	}
});
