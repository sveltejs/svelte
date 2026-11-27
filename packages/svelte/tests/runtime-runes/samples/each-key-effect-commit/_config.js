import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, raf }) {
		const [button, revive] = target.querySelectorAll('button');
		const outputs = target.querySelectorAll('output');
		const section = /** @type {HTMLElement} */ (target.querySelector('section'));
		const original = section.querySelector('div');
		for (const output of outputs) {
			assert.htmlEqual(output.innerHTML, '<p>0: a</p>');
		}

		/** @param {number} count */
		const rows = (count) =>
			'<p>0: a</p>' + Array.from({ length: count }, (_, j) => `<p>${j + 1}: b</p>`).join('');

		for (let i = 1; i <= 3; i++) {
			button.click();
			await tick();
			for (const output of outputs) {
				assert.htmlEqual(output.innerHTML, rows(i));
			}

			// A skipped controlled each must not append new rows to an outroing branch.
			// When the branch is revived, the discarded rows must be created again.
			assert.equal(section.querySelector('div'), original);
			assert.htmlEqual(section.innerHTML, `<div>${rows(i - (i % 2))}</div>`);

			if (i === 1) {
				revive.click();
				await tick();
				assert.equal(section.querySelector('div'), original);
				assert.htmlEqual(section.innerHTML, `<div>${rows(1)}</div>`);
				revive.click();
				await tick();
			}
		}

		raf.tick(110);
		await tick();
		assert.htmlEqual(section.innerHTML, '');

		button.click();
		await tick();
		assert.htmlEqual(section.innerHTML, `<div>${rows(4)}</div>`);
		assert.notEqual(section.querySelector('div'), original);
	}
});
