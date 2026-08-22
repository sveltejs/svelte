import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target }) {
		/**
		 * @param {NodeListOf<any>} options
		 * @param {any[]} selected
		 */
		function check_options(options, selected) {
			for (let i = 0; i < options.length; i++) {
				assert.equal(options[i].selected, selected[i], `option ${i}`);
			}
		}

		/**
		 * @param {HTMLSelectElement} select
		 * @param {number[]} indexes
		 */
		function select_options(select, indexes) {
			const options = select.querySelectorAll('option');
			for (let i = 0; i < options.length; i++) {
				options[i].selected = indexes.includes(i);
			}
			select.dispatchEvent(new Event('change', { bubbles: true }));
		}

		const reset = /** @type {HTMLInputElement} */ (target.querySelector('input[type=reset]'));
		const [test1, test2] = target.querySelectorAll('select');
		const span = /** @type {HTMLSpanElement} */ (target.querySelector('span'));

		// every option named by defaultValue is selected, not just none of them
		check_options(test1.querySelectorAll('option'), [true, false, true]);

		// an explicit value still wins over defaultValue
		check_options(test2.querySelectorAll('option'), [false, false, true]);
		assert.htmlEqual(span.innerHTML, 'c');

		// change both selections, then reset the form
		select_options(test1, [1]);
		select_options(test2, [0, 1]);
		flushSync();

		assert.htmlEqual(span.innerHTML, 'a,b');

		reset.click();
		await Promise.resolve();
		flushSync();

		// reset restores the default selection in both cases
		check_options(test1.querySelectorAll('option'), [true, false, true]);
		check_options(test2.querySelectorAll('option'), [true, false, true]);
		assert.htmlEqual(span.innerHTML, 'a,c');
	}
});
