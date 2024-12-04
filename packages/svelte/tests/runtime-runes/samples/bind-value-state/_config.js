import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<input type="number"><div>0</div>`,
	mode: ['client', 'hydrate'],

	async test({ assert, target }) {
		const [input1] = target.querySelectorAll('input');
		assert.equal(input1.value, '0');

		input1.value = '1';
		input1.dispatchEvent(new window.InputEvent('input'));

		flushSync();

		assert.equal(input1.value, '1');
		assert.htmlEqual(target.innerHTML, `<input type="number"><div>1</div>`);

		input1.value = '101';
		input1.dispatchEvent(new window.InputEvent('input'));
		flushSync();

		assert.equal(input1.value, '100');
		assert.htmlEqual(target.innerHTML, `<input type="number"><div>100</div>`);
	}
});
