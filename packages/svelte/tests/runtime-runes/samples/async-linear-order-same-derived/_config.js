import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [a, b, reset1, reset2, resolve1, resolve2] = target.querySelectorAll('button');

		resolve1.click();
		await tick();

		const p = /** @type {HTMLElement} */ (target.querySelector('#test'));

		assert.htmlEqual(p.innerHTML, '1 + 2 = 3');

		flushSync(() => reset1.click());
		flushSync(() => a.click());
		flushSync(() => reset2.click());
		flushSync(() => b.click());

		resolve2.click();
		await tick();

		assert.htmlEqual(p.innerHTML, '1 + 2 = 3');

		resolve1.click();
		await tick();

		assert.htmlEqual(p.innerHTML, '2 + 3 = 5');
	}
});
