import { tick } from 'svelte';
import { test } from '../../test';

// Batches A, B and C each write `d` (an async derived), in reverse order. Each earlier batch's
// value from before its write must be the one from before the later batch's write (i.e. `0`), not
// the later batch's uncommitted value — otherwise, once the later batches have merged into it,
// independent batches see that value instead of the committed one
export default test({
	async test({ assert, target }) {
		await tick();

		const buttons = Array.from(target.querySelectorAll('button'));

		/** @param {string} text */
		const click = async (text) => {
			buttons.find((b) => b.textContent === text)?.click();
			await tick();
		};

		const html = buttons.map((b) => b.outerHTML).join('');

		assert.htmlEqual(target.innerHTML, `${html}<p>0 0 0</p><p>y: 0, d: 0</p>`);

		// batches A, B and C
		await click('a');
		await click('b');
		await click('c');

		// `d` resolves in C, then B, then A
		await click('d100');
		await click('d10');
		await click('d1');

		// C merges into B, which then merges into A — A is still pending
		await click('c100');
		await click('b10');
		await click('d111');

		assert.htmlEqual(target.innerHTML, `${html}<p>0 0 0</p><p>y: 0, d: 0</p>`);

		// an independent batch sees the committed value of `d`
		await click('y');
		assert.htmlEqual(target.innerHTML, `${html}<p>0 0 0</p><p>y: 1, d: 0</p>`);
	}
});
