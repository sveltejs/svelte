import { tick } from 'svelte';
import { test } from '../../test';

// Tests that a newly created batch during an effect flush isn't rebased right away by the previous batch.#commit(),
// rescheduling an effect on the new batch that shouldn't run.
export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [increment, shift, pop] = target.querySelectorAll('button');

		increment.click();
		await tick();
		assert.deepEqual(logs, []);

		// Resolve the blocking await which shouldn't result in the derived execution capturing
		// the new derived value on the new batch, but on the previous batch which is currently flushing
		pop.click();
		await tick();
		assert.deepEqual(logs, [2]);

		// Resolve the non-blocking await which shouldn't result in #commit() rebasing the new batch
		shift.click();
		await tick();
		assert.deepEqual(logs, [2]);

		// Resolve the new batch's await
		shift.click();
		await tick();
		assert.deepEqual(logs, [2]);
	}
});
