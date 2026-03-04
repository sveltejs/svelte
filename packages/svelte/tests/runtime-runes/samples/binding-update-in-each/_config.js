import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],

	html: `<input><p>a</a>`,

	async test({ assert, target }) {
		const [input] = target.querySelectorAll('input');

		input.focus();
		input.value = 'ab';
		input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		flushSync();

		assert.htmlEqual(target.innerHTML, `<input><p>ab</a>`);
		assert.equal(input.value, 'ab');

		input.focus();
		input.value = 'abc';
		input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		flushSync();

		assert.htmlEqual(target.innerHTML, `<input><p>abc</a>`);
		assert.equal(input.value, 'abc');
	}
});
