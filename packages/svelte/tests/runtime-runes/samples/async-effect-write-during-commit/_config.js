import { tick } from 'svelte';
import { test } from '../../test';

// A write made by an effect while a batch commits goes to a new batch, but it's part of the committing batch's view
// from then on, too — otherwise the effects that run after it would see the committing batch's (stale) value
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [a, x] = target.querySelectorAll('button');

		// batch A, which is pending while the next one commits
		a.click();
		await tick();
		logs.length = 0;

		// the first effect writes `x = 2` while x's batch commits, the second runs after it
		x.click();
		await tick();
		assert.deepEqual([...new Set(logs)], ['x 2']);
	}
});
