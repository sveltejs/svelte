import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target }) {
		/**
		 * @param {NodeListOf<any>} inputs
		 * @param {string} field
		 * @param {any | any[]} value
		 */
		function check_inputs(inputs, field, value) {
			for (let i = 0; i < inputs.length; i++) {
				assert.equal(inputs[i][field], Array.isArray(value) ? value[i] : value, `field ${i}`);
			}
		}

		/**
		 * @param {any} input
		 * @param {string} field
		 * @param {any} value
		 */
		function set_input(input, field, value) {
			input[field] = value;
			input.dispatchEvent(new Event('input', { bubbles: true }));
		}

		/**
		 * @param {HTMLOptionElement} option
		 */
		function select_option(option) {
			option.selected = true;
			option.dispatchEvent(new Event('change', { bubbles: true }));
		}

		const after_reset = [];

		const reset = /** @type {HTMLInputElement} */ (target.querySelector('input[type=reset]'));
		const [test1, test2, test3, test4, test5] = target.querySelectorAll('div');
		const [test6, test7, test8, test9] = target.querySelectorAll('select');

		{
			/** @type {NodeListOf<HTMLInputElement | HTMLTextAreaElement>} */
			const inputs = test1.querySelectorAll('input, textarea');
			check_inputs(inputs, 'value', 'x');

			for (const input of inputs) {
				set_input(input, 'value', 'foo');
			}
			flushSync();
			check_inputs(inputs, 'value', 'foo');

			after_reset.push(() => check_inputs(inputs, 'value', 'x'));
		}

		{
			/** @type {NodeListOf<HTMLInputElement | HTMLTextAreaElement>} */
			const inputs = test2.querySelectorAll('input, textarea');
			check_inputs(inputs, 'value', 'y');

			for (const input of inputs) {
				set_input(input, 'value', 'foo');
			}
			flushSync();
			check_inputs(inputs, 'value', 'foo');

			after_reset.push(() => check_inputs(inputs, 'value', 'x'));
		}

		{
			/** @type {NodeListOf<HTMLInputElement>} */
			const inputs = test3.querySelectorAll('input');
			check_inputs(inputs, 'checked', true);

			for (const input of inputs) {
				set_input(input, 'checked', false);
			}
			flushSync();
			check_inputs(inputs, 'checked', false);

			after_reset.push(() => check_inputs(inputs, 'checked', true));
		}

		{
			/** @type {NodeListOf<HTMLInputElement>} */
			const inputs = test4.querySelectorAll('input');
			check_inputs(inputs, 'checked', false);

			after_reset.push(() => check_inputs(inputs, 'checked', true));
		}

		{
			/** @type {NodeListOf<HTMLInputElement>} */
			const inputs = test5.querySelectorAll('input');
			check_inputs(inputs, 'checked', true);

			after_reset.push(() => check_inputs(inputs, 'checked', false));
		}

		{
			/** @type {NodeListOf<HTMLInputElement>} */
			const inputs = test5.querySelectorAll('input');
			check_inputs(inputs, 'checked', true);

			after_reset.push(() => check_inputs(inputs, 'checked', false));
		}

		{
			/** @type {NodeListOf<HTMLOptionElement>} */
			const options = test6.querySelectorAll('option');
			check_inputs(options, 'selected', [false, true, false]);

			select_option(options[2]);
			flushSync();
			check_inputs(options, 'selected', [false, false, true]);

			after_reset.push(() => check_inputs(options, 'selected', [false, true, false]));
		}

		{
			/** @type {NodeListOf<HTMLOptionElement>} */
			const options = test7.querySelectorAll('option');
			check_inputs(options, 'selected', [false, true, false]);

			select_option(options[2]);
			flushSync();
			check_inputs(options, 'selected', [false, false, true]);

			after_reset.push(() => check_inputs(options, 'selected', [false, true, false]));
		}

		{
			/** @type {NodeListOf<HTMLOptionElement>} */
			const options = test8.querySelectorAll('option');
			check_inputs(options, 'selected', [false, false, true]);

			select_option(options[0]);
			flushSync();
			check_inputs(options, 'selected', [true, false, false]);

			after_reset.push(() => check_inputs(options, 'selected', [false, true, false]));
		}

		{
			/** @type {NodeListOf<HTMLOptionElement>} */
			const options = test9.querySelectorAll('option');
			check_inputs(options, 'selected', [false, false, true]);

			select_option(options[0]);
			flushSync();
			check_inputs(options, 'selected', [true, false, false]);

			after_reset.push(() => check_inputs(options, 'selected', [false, true, false]));
		}

		reset.click();
		flushSync();
		after_reset.forEach((fn) => fn());
	}
});
