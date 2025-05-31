import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [a, b, reset1, reset2, resolve1, resolve2] = target.querySelectorAll('button');

		flushSync(() => resolve1.click());
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await tick();
		flushSync();

		const p = /** @type {HTMLElement} */ (target.querySelector('#test'));

		assert.htmlEqual(p.innerHTML, '1 + 2 = 3');

		flushSync(() => reset1.click());
		flushSync(() => a.click());
		flushSync(() => reset2.click());
		flushSync(() => b.click());

		flushSync(() => resolve2.click());
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await tick();
		flushSync();

		assert.htmlEqual(p.innerHTML, '1 + 2 = 3');

		flushSync(() => resolve1.click());
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await tick();
		flushSync();

		assert.htmlEqual(p.innerHTML, '2 + 3 = 5');
	}
});
