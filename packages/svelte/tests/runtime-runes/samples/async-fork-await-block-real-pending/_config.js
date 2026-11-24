import { tick } from 'svelte';
import { test } from '../../test';

// A fork re-running an {#await} block must not make the real world's pending promise obsolete
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [fork, resolve_0, discard, resolve_1] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('#output');

		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');

		fork.click();
		await tick();

		resolve_0.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');

		discard.click();
		resolve_1.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q>');
	}
});
