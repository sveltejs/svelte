import { tick } from 'svelte';
import { test } from '../../test';

// Tests that a newly created batch during an effect flush isn't rebased right away by the previous batch.#commit(),
// rescheduling an effect on the new batch that shouldn't run.
export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [increment, resolve] = target.querySelectorAll('button');
		assert.deepEqual(logs, ['delay 0']);

		increment.click();
		await tick();
		assert.deepEqual(logs, ['delay 0', 'delay 2']);

		// This resolve should trigger the async effect only once
		resolve.click();
		await tick();
		assert.deepEqual(logs, ['delay 0', 'delay 2', 'effect run', 'delay 4']);

		resolve.click();
		await tick();
		assert.deepEqual(logs, ['delay 0', 'delay 2', 'effect run', 'delay 4']);
	}
});
