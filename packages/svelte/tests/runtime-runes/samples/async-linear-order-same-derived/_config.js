import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [a, b, shift, pop] = target.querySelectorAll('button');

		shift.click();
		await tick();

		const p = /** @type {HTMLElement} */ (target.querySelector('#test'));

		assert.htmlEqual(p.innerHTML, '1 + 2 = 3');

		flushSync(() => a.click());
		// the second batch re-runs the expression that the first one ran, so its view includes a = 2
		// (see `Batch#intersects`)
		flushSync(() => b.click());

		// it merges into the first batch, and its run supersedes the first batch's
		pop.click();
		await tick();

		assert.htmlEqual(p.innerHTML, '2 + 3 = 5');

		pop.click();
		await tick();

		assert.htmlEqual(p.innerHTML, '2 + 3 = 5');
	}
});
