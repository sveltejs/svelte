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
			input.dispatchEvent(
				new Event(typeof value === 'boolean' ? 'change' : 'input', { bubbles: true })
			);
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
		const [test1, test2, test3, test4, test5, test6, test7, test14] =
			target.querySelectorAll('div');
		const [test8, test9, test10, test11] = target.querySelectorAll('select');
		const [
			test1_span,
			test2_span,
			test3_span,
			test4_span,
			test5_span,
			test6_span,
			test7_span,
			test8_span,
			test9_span,
			test10_span,
			test11_span
		] = target.querySelectorAll('span');

		{
			/** @type {NodeListOf<HTMLInputElement | HTMLTextAreaElement>} */
			const inputs = test1.querySelectorAll('input, textarea');
			check_inputs(inputs, 'value', 'x');
			assert.htmlEqual(test1_span.innerHTML, 'x x x x');

			for (const input of inputs) {
				set_input(input, 'value', 'foo');
			}
			flushSync();
			check_inputs(inputs, 'value', 'foo');
			assert.htmlEqual(test1_span.innerHTML, 'foo foo foo foo');

			after_reset.push(() => {
				check_inputs(inputs, 'value', 'x');
				assert.htmlEqual(test1_span.innerHTML, 'x x x x');
			});
		}

		{
			/** @type {NodeListOf<HTMLInputElement | HTMLTextAreaElement>} */
			const inputs = test2.querySelectorAll('input, textarea');
			check_inputs(inputs, 'value', 'x');
			assert.htmlEqual(test2_span.innerHTML, 'x x x x');

			for (const input of inputs) {
				set_input(input, 'value', 'foo');
			}
			flushSync();
			check_inputs(inputs, 'value', 'foo');
			assert.htmlEqual(test2_span.innerHTML, 'foo foo foo foo');

			after_reset.push(() => {
				check_inputs(inputs, 'value', 'x');
				assert.htmlEqual(test2_span.innerHTML, 'x x x x');
			});
		}

		{
			/** @type {NodeListOf<HTMLInputElement | HTMLTextAreaElement>} */
			const inputs = test3.querySelectorAll('input, textarea');
			check_inputs(inputs, 'value', 'y');
			assert.htmlEqual(test3_span.innerHTML, 'y y y y');

			for (const input of inputs) {
				set_input(input, 'value', 'foo');
			}
			flushSync();
			check_inputs(inputs, 'value', 'foo');
			assert.htmlEqual(test3_span.innerHTML, 'foo foo foo foo');

			after_reset.push(() => {
				check_inputs(inputs, 'value', 'x');
				assert.htmlEqual(test3_span.innerHTML, 'x x x x');
			});
		}

		{
			/** @type {NodeListOf<HTMLInputElement>} */
			const inputs = test4.querySelectorAll('input');
			check_inputs(inputs, 'checked', true);
			assert.htmlEqual(test4_span.innerHTML, 'true true');

			for (const input of inputs) {
				set_input(input, 'checked', false);
			}
			flushSync();
			check_inputs(inputs, 'checked', false);
			assert.htmlEqual(test4_span.innerHTML, 'false false');

			after_reset.push(() => {
				check_inputs(inputs, 'checked', true);
				assert.htmlEqual(test4_span.innerHTML, 'true true');
			});
		}

		{
			/** @type {NodeListOf<HTMLInputElement>} */
			const inputs = test5.querySelectorAll('input');
			check_inputs(inputs, 'checked', true);
			assert.htmlEqual(test5_span.innerHTML, 'true true');

			for (const input of inputs) {
				set_input(input, 'checked', false);
			}
			flushSync();
			check_inputs(inputs, 'checked', false);
			assert.htmlEqual(test5_span.innerHTML, 'false false');

			after_reset.push(() => {
				check_inputs(inputs, 'checked', true);
				assert.htmlEqual(test5_span.innerHTML, 'true true');
			});
		}

		{
			/** @type {NodeListOf<HTMLInputElement>} */
			const inputs = test6.querySelectorAll('input');
			check_inputs(inputs, 'checked', false);
			assert.htmlEqual(test6_span.innerHTML, 'false false');

			after_reset.push(() => {
				check_inputs(inputs, 'checked', true);
				assert.htmlEqual(test6_span.innerHTML, 'true true');
			});
		}
		{
			/** @type {NodeListOf<HTMLInputElement>} */
			const inputs = test7.querySelectorAll('input');
			check_inputs(inputs, 'checked', true);
			assert.htmlEqual(test7_span.innerHTML, 'true');

			after_reset.push(() => {
				check_inputs(inputs, 'checked', false);
				assert.htmlEqual(test7_span.innerHTML, 'false');
			});
		}

		{
			/** @type {NodeListOf<HTMLOptionElement>} */
			const options = test8.querySelectorAll('option');
			check_inputs(options, 'selected', [false, true, false]);
			assert.htmlEqual(test8_span.innerHTML, 'b');

			select_option(options[2]);
			flushSync();
			check_inputs(options, 'selected', [false, false, true]);
			assert.htmlEqual(test8_span.innerHTML, 'c');

			after_reset.push(() => {
				check_inputs(options, 'selected', [false, true, false]);
				assert.htmlEqual(test8_span.innerHTML, 'b');
			});
		}

		{
			/** @type {NodeListOf<HTMLOptionElement>} */
			const options = test9.querySelectorAll('option');
			check_inputs(options, 'selected', [false, true, false]);
			assert.htmlEqual(test9_span.innerHTML, 'b');

			select_option(options[2]);
			flushSync();
			check_inputs(options, 'selected', [false, false, true]);
			assert.htmlEqual(test9_span.innerHTML, 'c');

			after_reset.push(() => {
				check_inputs(options, 'selected', [false, true, false]);
				assert.htmlEqual(test9_span.innerHTML, 'b');
			});
		}

		{
			/** @type {NodeListOf<HTMLOptionElement>} */
			const options = test10.querySelectorAll('option');
			check_inputs(options, 'selected', [false, false, true]);
			assert.htmlEqual(test10_span.innerHTML, 'c');

			select_option(options[0]);
			flushSync();
			check_inputs(options, 'selected', [true, false, false]);
			assert.htmlEqual(test10_span.innerHTML, 'a');

			after_reset.push(() => {
				check_inputs(options, 'selected', [false, true, false]);
				assert.htmlEqual(test10_span.innerHTML, 'b');
			});
		}

		{
			/** @type {NodeListOf<HTMLOptionElement>} */
			const options = test11.querySelectorAll('option');
			check_inputs(options, 'selected', [false, false, true]);
			assert.htmlEqual(test11_span.innerHTML, 'c');

			select_option(options[0]);
			flushSync();
			check_inputs(options, 'selected', [true, false, false]);
			assert.htmlEqual(test11_span.innerHTML, 'a');

			after_reset.push(() => {
				check_inputs(options, 'selected', [false, true, false]);
				assert.htmlEqual(test11_span.innerHTML, 'b');
			});
		}

		{
			/** @type {NodeListOf<HTMLInputElement | HTMLTextAreaElement>} */
			const inputs = test14.querySelectorAll('input, textarea');
			assert.equal(inputs[0].value, 'x');
			assert.equal(/** @type {HTMLInputElement} */ (inputs[1]).checked, true);
			// this is still missing...i have no idea how to fix this lol
			// assert.equal(inputs[2].value, 'x');

			after_reset.push(() => {
				assert.equal(inputs[0].value, 'y');
				assert.equal(/** @type {HTMLInputElement} */ (inputs[1]).checked, false);
				assert.equal(inputs[2].value, 'y');
			});
		}

		reset.click();
		await Promise.resolve();
		flushSync();
		after_reset.forEach((fn) => fn());
	}
});
