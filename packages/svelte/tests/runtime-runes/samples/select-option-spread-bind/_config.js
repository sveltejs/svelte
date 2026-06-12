import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	async test({ assert, target, component }) {
		const [select0, select1] = target.querySelectorAll('select');
		ok(select0);
		ok(select1);

		/**
		 * @param {HTMLOptionElement} option
		 */
		function get_option_value(option) {
			if ('__value' in option) {
				// @ts-ignore
				return option.__value;
			}

			return option.value;
		}

		/**
		 * @param {HTMLSelectElement} select
		 * @param {number} index
		 */
		function select_at(select, index) {
			select.selectedIndex = index;
			select.dispatchEvent(new Event('change', { bubbles: true }));
			flushSync();
		}

		for (let i = 0; i < select0.options.length; i += 1) {
			assert.deepEqual(
				get_option_value(select1.options[i]),
				get_option_value(select0.options[i]),
				`option __value should match at index ${i}`
			);
		}

		// nullish values all serialize to '' in the DOM, so select a distinct option first
		select_at(select0, 6);
		select_at(select1, 6);
		select_at(select0, 0);
		select_at(select1, 0);

		assert.equal(component.value0, undefined);
		assert.equal(component.value1, undefined);
	}
});
