import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	skip_no_async: true,
	async test({ assert, target }) {
		const [fork_btn, _toggle_btn, inc_count_1_btn] = target.querySelectorAll('button');
		const p = /** @type {HTMLElement} */ (target.querySelector('p'));

		assert.equal(p.textContent, '0');

		// Trigger derived to re-evaluate during fork and switch to tracking count_2
		flushSync(() => {
			fork_btn.click();
		});

		assert.equal(p.textContent, '0');

		flushSync(() => {
			inc_count_1_btn.click();
		});

		assert.equal(p.textContent, '1');
	}
});
