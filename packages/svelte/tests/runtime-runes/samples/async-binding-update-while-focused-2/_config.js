import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, instance }) {
		instance.shift();
		await tick();

		const [input] = target.querySelectorAll('input');

		input.focus();
		input.value = '1';
		input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await tick();

		assert.htmlEqual(target.innerHTML, `<input type="number" /> <p>0</p>`);
		assert.equal(input.value, '1');

		input.focus();
		input.value = '2';
		input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await tick();

		assert.htmlEqual(target.innerHTML, `<input type="number" /> <p>0</p>`);
		assert.equal(input.value, '2');

		instance.shift();
		await tick();
		assert.htmlEqual(target.innerHTML, `<input type="number" /> <p>1</p>`);
		assert.equal(input.value, '2');

		instance.shift();
		await tick();
		assert.htmlEqual(target.innerHTML, `<input type="number" /> <p>2</p>`);
		assert.equal(input.value, '2');
	}
});
