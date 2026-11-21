import { tick } from 'svelte';
import { test } from '../../test';
import { untracked_writes, set_untracked_writes } from '../../../../src/internal/client/runtime.js';

export default test({
	before_test() {
		set_untracked_writes(null);
	},
	after_test() {
		set_untracked_writes(null);
	},
	async test({ assert, target }) {
		const [next, resolve, reject, hide] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		for (let i = 0; i < 4; i++) {
			await tick();
			assert.htmlEqual(output.innerHTML, 'pending');

			(i % 2 === 0 ? resolve : reject).click();
			await tick();
			assert.htmlEqual(output.innerHTML, `<p>${i % 2 === 0 ? '' : 'error '}${i}</p>`);
			// Resolved values and errors must not escape into a module-level array.
			assert.equal(untracked_writes, null);

			next.click();
		}

		hide.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.equal(untracked_writes, null);
	}
});
