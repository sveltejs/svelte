import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	test({ assert, target, window, warnings }) {
		const input = /** @type {HTMLInputElement} */ (target.querySelector('input'));

		input.value = '2';
		input.dispatchEvent(new window.Event('input', { bubbles: true }));
		flushSync();

		assert.htmlEqual(target.innerHTML, '<input><p>2</p>');
		// binding a store property into a runes child must not warn about a non-reactive property
		assert.deepEqual(warnings, []);
	}
});
