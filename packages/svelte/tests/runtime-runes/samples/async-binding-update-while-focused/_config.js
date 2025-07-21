import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await new Promise((resolve) => setTimeout(resolve, 110));

		const [input] = target.querySelectorAll('input');

		assert.equal(input.value, 'a');
		assert.htmlEqual(target.innerHTML, `<p>a</p><input />`);

		flushSync(() => {
			input.focus();
			input.value = 'ab';
			input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		});

		await new Promise((resolve) => setTimeout(resolve, 50));

		flushSync(() => {
			input.focus();
			input.value = 'abc';
			input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		});

		await new Promise((resolve) => setTimeout(resolve, 60));

		assert.equal(input.value, 'abc');
		assert.htmlEqual(target.innerHTML, `<p>ab</p><input />`);

		await new Promise((resolve) => setTimeout(resolve, 60));

		assert.equal(input.value, 'abc');
		assert.htmlEqual(target.innerHTML, `<p>abc</p><input />`);
	}
});
