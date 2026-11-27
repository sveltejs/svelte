import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const own = /** @type {NodeListOf<HTMLInputElement>} */ (
			target.querySelectorAll('p.own input')
		);

		for (const input of own) {
			input.click();
			flushSync();
		}

		assert.deepEqual(
			Array.from(target.querySelectorAll('p.own'), (p) =>
				/** @type {string} */ (p.textContent).replace(/\s+/g, ' ').trim()
			),
			['t: a,b', 'd: a,b', 'l: a,b']
		);
		assert.deepEqual(
			Array.from(own, (input) => input.checked),
			[true, true, true, true, true, true]
		);

		// a group that doesn't depend on the snippet's parameters is still one group
		const shared = /** @type {NodeListOf<HTMLInputElement>} */ (
			target.querySelectorAll('input.shared')
		);

		shared[0].click();
		flushSync();
		shared[1].click();
		flushSync();

		assert.equal(target.querySelector('p.shared')?.textContent, 'x,y');
	}
});
