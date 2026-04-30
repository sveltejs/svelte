import { tick } from 'svelte';
import { test } from '../../test';

// Ensure that microtask timing doesn't influence whether or not a scheduled batch is flushed.
// Timing can be such that the current_batch is reset before the scheduled flush runs, which
// would cause the flush to skip without the fix.
export default test({
	async test({ assert, target }) {
		const [btn] = target.querySelectorAll('button');

		btn.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '1 1');
	}
});
