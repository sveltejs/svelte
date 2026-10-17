import { flushSync } from 'svelte';
import { test } from '../../assert';

export default test({
	mode: ['client'],
	async test({ assert, target, trustedClick }) {
		/** @param {string} name */
		function edit(name) {
			const form = /** @type {HTMLFormElement} */ (target.querySelector(`form.${name}`));
			const [checkbox, input, select] = /** @type {any[]} */ ([...form.elements]);

			checkbox.click();
			input.value = 'hi';
			input.dispatchEvent(new Event('input'));
			select.value = 'b';
			select.dispatchEvent(new Event('change'));
			flushSync();

			return { checkbox, input, select };
		}

		/** @param {string} name */
		function state(name) {
			return target.querySelector(`p.${name}`)?.textContent;
		}

		// unlike `form.reset()` or `button.click()`, a real click runs microtasks in between the
		// `reset` listeners, before the form's `onreset` handler has called `preventDefault()`
		const prevented = edit('prevented');
		assert.equal(state('prevented'), '{"checked":true,"text":"hi","select":"b"}');

		await trustedClick('form.prevented button');
		await new Promise((r) => setTimeout(r, 10));
		flushSync();

		assert.equal(state('prevented'), '{"checked":true,"text":"hi","select":"b"}');
		assert.equal(prevented.checkbox.checked, true);
		assert.equal(prevented.input.value, 'hi');
		assert.equal(prevented.select.value, 'b');

		const allowed = edit('allowed');
		assert.equal(state('allowed'), '{"checked":true,"text":"hi","select":"b"}');

		await trustedClick('form.allowed button');
		await new Promise((r) => setTimeout(r, 10));
		flushSync();

		assert.equal(state('allowed'), '{"checked":false,"text":"","select":"a"}');
		assert.equal(allowed.checkbox.checked, false);
		assert.equal(allowed.input.value, '');
		assert.equal(allowed.select.value, 'a');
	}
});
