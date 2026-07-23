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
		flushSync(() => b.click());

		// both updates share the awaited expression, so the batches are merged —
		// the first in-flight run is superseded, and resolving the latest run
		// (which pop reaches first) commits the combined state
		pop.click();
		await tick();

		assert.htmlEqual(p.innerHTML, '2 + 3 = 5');

		// resolving the superseded run does nothing
		pop.click();
		await tick();

		assert.htmlEqual(p.innerHTML, '2 + 3 = 5');
	}
});
