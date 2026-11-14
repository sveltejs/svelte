import { tick } from 'svelte';
import { test } from '../../test';

// Like `error-boundary-19`, but the derived throws while another batch is pending, i.e. it is read
// in a batch's view of the world: every reader must see the error, not a stale value
export default test({
	async test({ assert, target, logs }) {
		const [other, count, resolve] = target.querySelectorAll('button');

		resolve.click();
		await tick();

		// pending async work
		other.click();
		await tick();

		count.click();
		await tick();
		count.click();
		await tick();

		assert.deepEqual(logs, ['error caught 1', 'error caught 2']);
	}
});
