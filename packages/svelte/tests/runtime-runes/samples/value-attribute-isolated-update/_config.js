import { test, ok } from '../../test';
import { flushSync } from 'svelte';

export default test({
	mode: ['client'],

	async test({ assert, target }) {
		/**
		 * @type {HTMLInputElement | null}
		 */
		const input = target.querySelector('input[type=text]');
		const button = target.querySelector('button');
		/**
		 * @type {HTMLInputElement | null}
		 */
		const checkbox = target.querySelector('input[type=checkbox]');
		const textarea = target.querySelector('textarea');
		ok(input);
		ok(button);
		ok(checkbox);
		ok(textarea);

		flushSync(() => {
			input.value = 'foo';
			checkbox.click();
			textarea.innerHTML = 'bar';
			button.click();
		});

		assert.equal(input.value, 'foo');
		assert.equal(checkbox.checked, true);
		assert.equal(textarea.innerHTML, 'bar');
	}
});
