import { tick } from 'svelte';
import { test } from '../../test';

// Assigning to a derived whose value is an error replaces the error. Before, the assignment was
// treated as an error itself, so reading the derived threw the assigned value
export default test({
	async test({ assert, target, logs }) {
		const [increment, assign] = target.querySelectorAll('button');

		increment.click();
		await tick();
		assert.deepEqual(logs, ['threw error']);

		assign.click();
		await tick();
		assert.deepEqual(logs, ['threw error', 42]);

		increment.click();
		await tick();
		assert.deepEqual(logs, ['threw error', 42, 2]);
	}
});
