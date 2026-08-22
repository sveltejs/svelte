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
		 * @param {HTMLOptionElement} option
		 */
		function select_option(option) {
			option.selected = true;
			option.dispatchEvent(new Event('change', { bubbles: true }));
		}

		const reset = /** @type {HTMLInputElement} */ (target.querySelector('input[type=reset]'));
		const [test1, test2, test3] = target.querySelectorAll('select');
		const [test1_span, test2_span, test3_span] = target.querySelectorAll('span');

		// defaultValue selects the matching option when no value is given
		{
			const options = test1.querySelectorAll('option');
			check_options(options, [false, true, false]);
			assert.htmlEqual(test1_span.innerHTML, 'b');
		}

		// an explicit value wins over defaultValue, but reset goes back to defaultValue
		{
			const options = test2.querySelectorAll('option');
			check_options(options, [false, false, true]);
			assert.htmlEqual(test2_span.innerHTML, 'c');
		}

		// static defaultValue behaves the same as the dynamic one
		{
			const options = test3.querySelectorAll('option');
			check_options(options, [false, true, false]);
			assert.htmlEqual(test3_span.innerHTML, 'b');
		}

		// change the selection, then reset the form
		select_option(test1.querySelectorAll('option')[2]);
		select_option(test2.querySelectorAll('option')[0]);
		select_option(test3.querySelectorAll('option')[2]);
		flushSync();

		assert.htmlEqual(test1_span.innerHTML, 'c');
		assert.htmlEqual(test2_span.innerHTML, 'a');
		assert.htmlEqual(test3_span.innerHTML, 'c');

		reset.click();
		await Promise.resolve();
		flushSync();

		check_options(test1.querySelectorAll('option'), [false, true, false]);
		check_options(test2.querySelectorAll('option'), [false, true, false]);
		check_options(test3.querySelectorAll('option'), [false, true, false]);
		assert.htmlEqual(test1_span.innerHTML, 'b');
		assert.htmlEqual(test2_span.innerHTML, 'b');
		assert.htmlEqual(test3_span.innerHTML, 'b');
	}
});
