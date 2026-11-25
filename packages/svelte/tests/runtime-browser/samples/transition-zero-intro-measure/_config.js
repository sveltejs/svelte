import { tick } from 'svelte';
import { test } from '../../assert';

export default test({
	async test({ assert, target, waitUntil }) {
		const [button] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		button.click();
		await tick();

		// Initial ticks must run after all transition functions have measured.
		assert.htmlEqual(output.innerHTML, 'child options, parent measure: 20px, child tick: 0');
		assert.equal(target.querySelectorAll('div')[1].style.height, '100px');

		await waitUntil(() => output.textContent?.includes('child end'));
		assert.htmlEqual(
			output.innerHTML,
			'child options, parent measure: 20px, child tick: 0, child start, child tick: 1, child end'
		);
	}
});
