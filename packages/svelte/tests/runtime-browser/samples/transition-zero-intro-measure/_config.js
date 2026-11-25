import { tick } from 'svelte';
import { test } from '../../assert';

export default test({
	async test({ assert, target }) {
		const [button] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		button.click();
		await tick();

		assert.htmlEqual(
			output.innerHTML,
			'child options, parent measure: 20px, child start, child end'
		);
		assert.equal(target.querySelectorAll('div')[1].style.height, '100px');
	}
});
