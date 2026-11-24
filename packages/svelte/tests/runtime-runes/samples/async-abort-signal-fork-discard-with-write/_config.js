import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [fork, discard] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		fork.click();
		await tick();

		// Destroying speculative work must not absorb the real state update.
		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>1</p>');
	}
});
