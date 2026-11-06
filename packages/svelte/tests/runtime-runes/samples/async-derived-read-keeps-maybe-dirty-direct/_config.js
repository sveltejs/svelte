import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>s</button><button>u</button><button>d</button><button>resolve a</button><button>resolve b</button><button>resolve c</button>';

// Like `async-derived-read-keeps-maybe-dirty`, but the `<span>` also reads `s`, which makes it DIRTY
// rather than MAYBE_DIRTY, so A doesn't evaluate `d` even when checking the `<span>` effect eagerly
// (`is_dirty` returns right away). C's read of `d` must still not leak into B's view
// TODO superfluous test?
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [s, u, d, resolve_a, resolve_b, resolve_c] = target.querySelectorAll('button');

		// batch A: `d` becomes 10, but is not evaluated yet (the `<span>` is deferred)
		s.click();
		await tick();

		// batch B
		u.click();
		await tick();

		// batch C writes `s` and reads `d` (20) while A and B are pending
		d.click();
		await tick();

		// B is independent of A and C (it doesn't write `s`), so neither change is part of its
		// view: `s` is 0, so `d` is 0 in its world, and B commits that world
		resolve_b.click();
		await tick();
		assert.equal(logs[0], 'probe 0');
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>0</p><span>0-0</span><i>0</i>`);

		// once A's and C's async work is done, the latest world is shown
		resolve_a.click();
		await tick();
		resolve_c.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>2</p><p>1</p><span>2-20</span><i>20</i>`);
	}
});
