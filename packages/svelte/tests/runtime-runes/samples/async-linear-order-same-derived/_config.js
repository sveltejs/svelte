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

		pop.click();
		await tick();

		assert.htmlEqual(p.innerHTML, '1 + 3 = 4');

		pop.click();
		await tick();

		assert.htmlEqual(p.innerHTML, '2 + 3 = 5');
	}
});
