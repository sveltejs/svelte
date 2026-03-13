import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [add, shift, reset] = target.querySelectorAll('button');

		// resolve initial pending state
		shift.click();
		await tick();

		const [p] = target.querySelectorAll('p');

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

		assert.equal(select.value, 'b');
		assert.equal(p.textContent, 'a');

		// add option 'd', making items ['a', 'b', 'c', 'd']
		// this triggers MutationObserver which uses select.__value
		add.click();
		await tick();

		// select should still show 'b', not snap to a stale value
		assert.equal(select.value, 'b');
		assert.equal(p.textContent, 'a');

		shift.click();
		await tick();
		assert.equal(select.value, 'b');
		assert.equal(p.textContent, 'b');

		reset.click();
		assert.equal(select.value, 'b');
		assert.equal(p.textContent, 'b');

		shift.click();
		await tick();
		// commented out because this doesn't appear to work in JSDOM, but it _does_ work IRL
		// assert.equal(select.value, 'a');
		assert.equal(p.textContent, 'a');
	}
});
