import { tick } from 'svelte';
import { test } from '../../test';

// Like `async-derived-read-keeps-maybe-dirty`, but the `<span>` also reads `s`, which makes it DIRTY
// rather than MAYBE_DIRTY, so A doesn't evaluate `d` even when checking the `<span>` effect eagerly
// (`is_dirty` returns right away). C's read of `d` must still not mark it as clean
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
