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
		const [test1, test2] = target.querySelectorAll('select');
		const [test1_span] = target.querySelectorAll('span');

		// a spread carrying defaultValue selects the matching option
		{
			const options = test1.querySelectorAll('option');
			check_options(options, [false, true, false]);
			assert.htmlEqual(test1_span.innerHTML, 'b');
		}

		// value in the same spread still wins over defaultValue
		{
			const options = test2.querySelectorAll('option');
			check_options(options, [false, false, true]);
		}

		// changing the selection and resetting goes back to defaultValue
		select_option(test1.querySelectorAll('option')[2]);
		select_option(test2.querySelectorAll('option')[0]);
		flushSync();

		assert.htmlEqual(test1_span.innerHTML, 'c');

		reset.click();
		await Promise.resolve();
		flushSync();

		check_options(test1.querySelectorAll('option'), [false, true, false]);
		check_options(test2.querySelectorAll('option'), [false, true, false]);
		assert.htmlEqual(test1_span.innerHTML, 'b');
	}
});
