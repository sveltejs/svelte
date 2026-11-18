import { tick } from 'svelte';
import { test } from '../../test';

// Resolving a fork's {#await} promise must not interfere with real work happening at the same time
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [input] = target.querySelectorAll('input');
		const [set_a, fork, discard, set_a_after_b, resolve_a, resolve_b] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('#output');

		const set_a_with = (/** @type {number} */ n) => {
			input.value = String(n);
			set_a.click();
		};

		const fork_with = (/** @type {number} */ n) => {
			input.value = String(n);
			fork.click();
		};

		const set_a_after_b_with = (/** @type {number} */ n) => {
			input.value = String(n);
			set_a_after_b.click();
		};

		const resolve_a_with = (/** @type {number} */ n) => {
			input.value = String(n);
			resolve_a.click();
		};

		const resolve_b_with = (/** @type {number} */ n) => {
			input.value = String(n);
			resolve_b.click();
		};

		resolve_a_with(0);
		resolve_b_with(0);
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>0</q><s>0|0</s>');

		// the real update's pending state is queued while the fork's promise resolves:
		// it must not end up in the fork
		fork_with(1);
		await tick();
		set_a_with(1);
		resolve_b_with(1);
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i><s>0|1</s>');
		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i><s>0|1</s>');
		resolve_a_with(1);
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>1</q><s>0|1</s>');

		// a real update right after the fork's promise resolved (in the fork) must still show
		fork_with(2);
		await tick();
		set_a_after_b_with(5);
		resolve_b_with(2);
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i><s>0|5</s>');
		discard.click();
		resolve_a_with(5);
		await tick();
		assert.htmlEqual(output.innerHTML, '<q>5</q><s>0|5</s>');
	}
});
