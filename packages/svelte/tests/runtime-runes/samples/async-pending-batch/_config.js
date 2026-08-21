import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	// This test mainly checks that we don't run into the 'Batch has scheduled roots' invariant wrongly.
	// It is crafted such that two batches are scheduled to run in the same microtask, and the first
	// tries to rebase the second.
	async test({ assert, target }) {
		await tick();
		const [run] = target.querySelectorAll('button');

		run.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>run</button> none none 0');
	}
});
