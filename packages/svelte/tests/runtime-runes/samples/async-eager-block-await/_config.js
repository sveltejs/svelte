import { tick } from 'svelte';
import { test } from '../../test';

// A block that re-runs eagerly because an effect wrote what it reads (here, the
// effect sets `indirect` when `trigger` changes) must only work out which branch
// it selects — its branch is rendered by the next batch, and so waits for its
// `await`, just like a block that changes through a regular state update
export default test({
	mode: ['client'],

	async test({ assert, target }) {
		const [indirect, direct, shift] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('#output');

		indirect.click();
		assert.htmlEqual(output.innerHTML, '');

		await tick();
		assert.htmlEqual(output.innerHTML, '');

		direct.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');

		// resolve both awaits
		shift.click();
		await tick();

		assert.htmlEqual(output.innerHTML, '<p>indirect</p><p>hello</p>');
		shift.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>indirect</p><p>hello</p><p>direct</p><p>hello</p>');
	}
});
