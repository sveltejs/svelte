import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [show, runs] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		show.click();
		await tick();
		assert.htmlEqual(target.querySelector('p')?.innerHTML ?? '', '10 10');

		runs.click();
		await tick();
		// each derived in the chain runs once, not once per path through the chain
		assert.htmlEqual(output.innerHTML, '10');
	}
});
