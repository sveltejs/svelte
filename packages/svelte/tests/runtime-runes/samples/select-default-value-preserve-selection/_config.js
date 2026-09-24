import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [nothing, unmatched, spread, late, touched] = target.querySelectorAll('select');
		const [change_default, change_spread, load, add] = target.querySelectorAll('button');
		const p = target.querySelector('p');
		ok(p);

		assert.equal(nothing.selectedIndex, -1);
		assert.equal(unmatched.selectedIndex, -1);
		assert.equal(spread.selectedIndex, -1);
		assert.equal(late.selectedIndex, -1);
		assert.equal(touched.value, 'b');

		change_default.click();
		change_spread.click();
		flushSync();

		assert.equal(nothing.selectedIndex, -1);
		assert.equal(unmatched.selectedIndex, -1);
		assert.equal(spread.selectedIndex, -1);
		assert.equal(spread.className, 'two');
		assert.htmlEqual(p.innerHTML, 'zzz null');
		assert.deepEqual(
			[...nothing.options].map((option) => option.defaultSelected),
			[true, false]
		);

		// a default change never moves the current selection
		assert.equal(touched.value, 'b');

		// a default whose option arrives later selects it
		load.click();
		flushSync();
		await Promise.resolve();
		assert.equal(late.value, 'b');

		// a user selection survives option mutations and default changes
		touched.options[2].selected = true;
		touched.dispatchEvent(new Event('change', { bubbles: true }));
		add.click();
		flushSync();
		await Promise.resolve();
		assert.equal(touched.value, 'c');
		assert.deepEqual(
			[...touched.options].map((option) => option.defaultSelected),
			[true, false, false, false]
		);
	}
});
