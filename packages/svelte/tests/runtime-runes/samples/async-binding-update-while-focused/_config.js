import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();

		const [input] = target.querySelectorAll('input');

		input.focus();
		input.value = '3';
		input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await tick();

		assert.equal(input.value, '3');
		assert.htmlEqual(target.innerHTML, `<p>3</p> <input type="number" />`);

		input.focus();
		input.value = '1';
		input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await tick();

		assert.equal(input.value, '2');
		assert.htmlEqual(target.innerHTML, `<p>2</p> <input type="number" />`);
	}
});
