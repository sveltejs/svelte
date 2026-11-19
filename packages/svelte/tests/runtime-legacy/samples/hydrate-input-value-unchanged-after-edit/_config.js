import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();

		const [text, a, b] = target.querySelectorAll('input');
		const [update_count, update_values, check] = target.querySelectorAll('button');
		const form = /** @type {HTMLFormElement} */ (target.querySelector('form'));

		assert.deepEqual([text.value, a.checked, b.checked], ['initial', true, false]);
		text.value = 'typed';
		b.click();

		// A cached checked expression must not undo the radio group's native selection.
		for (let i = 0; i < 2; i++) {
			update_count.click();
			flushSync();
			assert.equal(a.getAttribute('data-count'), String(i + 1));
			assert.deepEqual([text.value, a.checked, b.checked], ['typed', false, true]);
		}

		a.click();
		update_values.click();
		flushSync();
		assert.deepEqual([text.value, a.checked, b.checked], ['updated', false, false]);

		check.click();
		flushSync();
		assert.equal(a.checked, true);

		form.reset();
		await tick();
		assert.deepEqual([text.value, a.checked, b.checked], ['', false, false]);

		update_count.click();
		flushSync();
		assert.deepEqual([text.value, a.checked, b.checked], ['', false, false]);
	}
});
