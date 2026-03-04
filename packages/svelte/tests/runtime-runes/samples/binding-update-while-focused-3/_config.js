import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],

	async test({ assert, target }) {
		const [input] = target.querySelectorAll('input');

		input.focus();
		input.value = 'Ab';
		input.dispatchEvent(new InputEvent('input', { bubbles: true }));

		await tick();
		await tick();

		assert.equal(input.value, 'AB');
		assert.htmlEqual(target.innerHTML, `<input /><p>AB</p>`);

		input.focus();
		input.value = 'ABc';
		input.dispatchEvent(new InputEvent('input', { bubbles: true }));

		await tick();
		await tick();

		assert.equal(input.value, 'ABC');
		assert.htmlEqual(target.innerHTML, `<input /><p>ABC</p>`);
	}
});
