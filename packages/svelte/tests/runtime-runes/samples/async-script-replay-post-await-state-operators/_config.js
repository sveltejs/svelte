import { settled, tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		await settled();
		const [number, bigint, replace] = target.querySelectorAll('button');
		const [input] = target.querySelectorAll('input');
		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, '7|1|1|1|ready');

		number.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '7|1|1|1|number:1,3,3,1');

		bigint.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '7|1|1|1|bigint:1,3,3,1');

		replace.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '7|5|1|2|replace');
		assert.equal(input.value, '5');

		input.value = '9';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await tick();
		assert.htmlEqual(output.innerHTML, '7|9|1|2|replace');
		assert.equal(target.querySelector('output'), output);
		assert.equal(target.querySelector('input'), input);
	}
});
