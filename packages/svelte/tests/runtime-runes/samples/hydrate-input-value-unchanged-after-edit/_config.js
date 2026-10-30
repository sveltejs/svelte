import { flushSync, tick } from 'svelte';
import { test } from '../../test';

// Unchanged one-way values must survive unrelated template effect updates.
export default test({
	async test({ assert, target }) {
		// Let the deferred removal of server-rendered default attributes run.
		await tick();

		const [text, checkbox] = /** @type {NodeListOf<HTMLInputElement>} */ (
			target.querySelectorAll('input')
		);
		const [update_count, update_values] = target.querySelectorAll('button');
		const form = /** @type {HTMLFormElement} */ (target.querySelector('form'));

		text.value = 'typed';
		text.dispatchEvent(new window.Event('input'));
		checkbox.checked = false;
		checkbox.dispatchEvent(new window.Event('change'));

		for (let i = 0; i < 2; i++) {
			update_count.click();
			flushSync();

			assert.deepEqual([text.value, checkbox.checked], ['typed', false]);
			assert.equal(text.getAttribute('data-count'), String(i + 1));
		}

		// Actual expression changes must still update the controls.
		checkbox.checked = true;
		update_values.click();
		flushSync();

		assert.deepEqual([text.value, checkbox.checked], ['updated', false]);

		// SSR attributes must not become the form's reset defaults.
		form.reset();
		await tick();
		assert.deepEqual([text.value, checkbox.checked], ['', false]);

		update_count.click();
		flushSync();
		assert.deepEqual([text.value, checkbox.checked], ['', false]);
	}
});
