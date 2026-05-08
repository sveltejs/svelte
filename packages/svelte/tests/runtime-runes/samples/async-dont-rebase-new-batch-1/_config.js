import { tick } from 'svelte';
import { test } from '../../test';

// Tests that a newly created batch during an effect flush isn't rebased right away by the previous batch.#commit(),
// rescheduling an effect on the new batch that shouldn't run.
export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [increment, resolve] = target.querySelectorAll('button');

		increment.click();
		await tick();
		assert.deepEqual(logs, []);

		// This resolve
		// - shouldn't result in the derived execution capturing the new derived value on the new batch, but on the previous batch which is currently flushing
		// - shouldn't result in #commit() rebasing the new batch
		resolve.click();
		await tick();
		assert.deepEqual(logs, [2]);

		// As a result, this resolve shouldn't result in another execution of the effect depending on the derived
		resolve.click();
		await tick();
		assert.deepEqual(logs, [2]);
	}
});
