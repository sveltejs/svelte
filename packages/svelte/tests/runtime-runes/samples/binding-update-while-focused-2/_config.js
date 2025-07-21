import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [input] = target.querySelectorAll('input');

		assert.equal(input.value, '2');
		assert.htmlEqual(target.innerHTML, `<p>2</p><input type="number" />`);

		flushSync(() => {
			input.focus();
			input.value = '3';
			input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		});
		assert.equal(input.value, '3');
		assert.htmlEqual(target.innerHTML, `<p>3</p><input type="number" />`);

		flushSync(() => {
			input.focus();
			input.value = '6';
			input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		});
		assert.equal(input.value, '5');
		assert.htmlEqual(target.innerHTML, `<p>5</p><input type="number" />`);
	}
});
