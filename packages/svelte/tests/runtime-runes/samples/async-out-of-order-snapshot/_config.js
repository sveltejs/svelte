import { tick } from 'svelte';
import { test } from '../../test';

// Batches A, B and C each write `d` (an async derived), in reverse order. Sharing an async
// result doesn't make them intersect: each can commit independently, rebasing the others.
// Independent batches must see the committed result, not an uncommitted or outdated one.
export default test({
	async test({ assert, target }) {
		await tick();

		const buttons = Array.from(target.querySelectorAll('button'));

		/** @param {string} text */
		const click = async (text) => {
			buttons.find((b) => b.textContent === text).click();
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

		// None of the async results have committed yet
		await click('y');
		assert.htmlEqual(target.innerHTML, `${html}<p>0 0 0</p><p>y: 1, d: 0</p>`);

		await click('c100');
		assert.htmlEqual(target.innerHTML, `${html}<p>0 0 100</p><p>y: 1, d: 100</p>`);

		await click('y');
		assert.htmlEqual(target.innerHTML, `${html}<p>0 0 100</p><p>y: 2, d: 100</p>`);

		// C is resolved, so A and B are rebased
		await click('b10');
		await click('d110');
		assert.htmlEqual(target.innerHTML, `${html}<p>0 10 100</p><p>y: 2, d: 110</p>`);

		// an independent batch sees the committed value of `d`
		await click('y');
		assert.htmlEqual(target.innerHTML, `${html}<p>0 10 100</p><p>y: 3, d: 110</p>`);

		// B is resolved, so A is rebased
		await click('a1');
		await click('d111');
		assert.htmlEqual(target.innerHTML, `${html}<p>1 10 100</p><p>y: 3, d: 111</p>`);
	}
});
