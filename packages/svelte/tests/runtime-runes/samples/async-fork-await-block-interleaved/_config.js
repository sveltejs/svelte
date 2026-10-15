import { tick } from 'svelte';
import { test } from '../../test';

// Resolving a fork's {#await} promise must not interfere with real work happening at the same time
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [
			fork_1,
			fork_2,
			discard,
			set_a_1,
			set_a_5_after_b,
			resolve_a_0,
			resolve_a_1,
			resolve_a_5,
			resolve_b_0,
			resolve_b_1,
			resolve_b_2
		] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('#output');

		resolve_a_0.click();
		resolve_b_0.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q><s>0|0</s>');

		// the real update's pending state is queued while the fork's promise resolves:
		// it must not end up in the fork
		fork_1.click();
		await tick();
		set_a_1.click();
		resolve_b_1.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i><s>0|1</s>');
		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i><s>0|1</s>');
		resolve_a_1.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>1</q><s>0|1</s>');

		// a real update right after the fork's promise resolved (in the fork) must still show
		fork_2.click();
		await tick();
		set_a_5_after_b.click();
		resolve_b_2.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i><s>0|5</s>');
		discard.click();
		resolve_a_5.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>5</q><s>0|5</s>');
	}
});
