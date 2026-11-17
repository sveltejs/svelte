import { tick } from 'svelte';
import { test } from '../../test';

// The initial batch has committed its writes, but its script still has pending work.
// An unrelated commit must not discard it as an empty subset of that batch's writes.
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [bump, resolve] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		await tick();
		assert.htmlEqual(output.innerHTML, '');

		bump.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');

		resolve.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>one ready 1</p>');
	}
});
