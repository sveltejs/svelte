import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	test({ assert, target }) {
		const [nothing, unmatched, spread] = target.querySelectorAll('select');
		const p = target.querySelector('p');
		const [change_default, change_spread] = target.querySelectorAll('button');
		ok(p);

		assert.equal(nothing.selectedIndex, -1);
		assert.equal(unmatched.selectedIndex, -1);
		assert.equal(spread.selectedIndex, -1);

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
	}
});
