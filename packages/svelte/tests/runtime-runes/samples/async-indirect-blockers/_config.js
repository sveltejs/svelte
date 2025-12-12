import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['async-server', 'client', 'hydrate'],
	ssrHtml:
		'<input value=""> <p></p> <input value=""> <p></p> <input value=""> <p></p> <input value=""> <p></p>',

	async test({ assert, target }) {
		await tick();

		const inputs = Array.from(target.querySelectorAll('input'));
		const paragraphs = Array.from(target.querySelectorAll('p'));

		for (let i = 0; i < 4; i++) {
			assert.equal(inputs[i].value, '');
			assert.htmlEqual(paragraphs[i].innerHTML, '');

			inputs[i].value = 'hello';
			inputs[i].dispatchEvent(new InputEvent('input', { bubbles: true }));
			await tick();

			assert.equal(inputs[i].value, 'hello');
			assert.htmlEqual(paragraphs[i].innerHTML, 'hello');
		}
	}
});
