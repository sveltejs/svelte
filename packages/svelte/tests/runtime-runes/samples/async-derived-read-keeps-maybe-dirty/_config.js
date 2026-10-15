import { tick } from 'svelte';
import { test } from '../../test';

// Like `async-derived-assign-keeps-maybe-dirty`, but C reads `d` in the event handler instead of
// assigning to it. That records `d`'s stale value (A never evaluated it) as C's previous value, and
// must not mark `d` as clean: B never stashed a reaction that reads `d`, so it wouldn't re-validate
// it and would use that stale value
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [s, u, d, , resolve_b] = target.querySelectorAll('button');

		// batch A: `d` becomes 10, but is not evaluated yet (the `<span>` is deferred)
		s.click();
		await tick();

		// batch B
		u.click();
		await tick();

		// batch C writes `s` and reads `d` (20) while A and B are pending
		d.click();
		await tick();

		// B sees A's change (but not C's), so `d` is 10 in its world
		resolve_b.click();
		await tick();
		assert.equal(logs[0], 'probe 10');
	}
});
