import { tick } from 'svelte';
import { test } from '../../test';

// An {#await} block without dependencies can't re-run, so it is the same in every batch: if it's
// created in a fork, a real batch that adopts the fork's branch must see its states as well
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [fork, show, resolve, discard] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('#output');

		fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0</p>');

		show.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i><p>0</p>');

		resolve.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>5</q><p>0</p>');

		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>5</q><p>0</p>');
	}
});
