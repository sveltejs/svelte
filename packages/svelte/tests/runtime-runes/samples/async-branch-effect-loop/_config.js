import { settled, tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: { dev: false },
	async test({ assert, target }) {
		await tick();
		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, '<p>start</p>');
		const [button] = target.querySelectorAll('button');
		button.click();
		await tick();
		await tick();
		await tick();
		await settled();
		assert.htmlEqual(output.innerHTML, '<p>done</p>');
	}
});
