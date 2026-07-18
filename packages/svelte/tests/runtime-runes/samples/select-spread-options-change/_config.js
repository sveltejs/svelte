import { flushSync } from 'svelte';
import { ok, test } from '../../test';

// https://github.com/sveltejs/svelte/issues/18557
export default test({
	async test({ assert, target }) {
		const select = target.querySelector('select');
		const btn = target.querySelector('button');
		ok(select);
		ok(btn);

		// no value was ever provided, so the browser selects the first option
		assert.equal(select.selectedIndex, 0);

		flushSync(() => btn.click());

		// wait for the MutationObserver installed by the spread to run
		await new Promise((resolve) => setTimeout(resolve, 0));

		assert.equal(select.options.length, 3);
		assert.equal(select.selectedIndex, 0);
	}
});
