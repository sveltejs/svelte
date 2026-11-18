import { tick } from 'svelte';
import { test } from '../../test';

// An assignment to a derived made while a batch commits goes to a new batch, but it's part of the committing
// batch's view from then on, too (like any write, see `async-effect-write-during-commit`) — as an assignment,
// so the effects that run after it in that commit see the assigned value rather than a computed one
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [a, x] = target.querySelectorAll('button');

		// batch A, which is pending while the next one commits
		a.click();
		await tick();
		logs.length = 0;

		// the first effect assigns `d = 99` while x's batch commits, the second runs after it
		x.click();
		await tick();
		assert.deepEqual(logs, ['d 99']);
	}
});
