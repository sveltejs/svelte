import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>up</button>
	<button>down</button>
	<button>show1</button>
	<button>show2</button>
	<button>shift a</button>
	<button>shift t</button>
`;

export default test({
	async test({ assert, target }) {
		await tick();

		const [up, down, show1, show2, shift_a, shift_t] = target.querySelectorAll('button');

		// batch A: reveals boundary 1 -> commits with pending snippet, stays live
		show1.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>loading 1...</p>`);

		// batch B: reveals boundary 2 -> commits with pending snippet, stays live
		show2.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>loading 1...</p> <p>loading 2...</p>`);

		// batch C: writes a=1; the async-a effect re-runs in C, which stays pending
		up.click();
		await tick();

		// A's continuation first-reads `a`. A has already committed; in its view C's
		// pending write is undone, so it reads the committed value (0) rather than leaking
		// C's uncommitted a=1, and boundary 1 resolves with it. The read is outdated
		// compared to C's a=1, so the late reader re-runs (and re-awaits a fresh deferred)
		shift_t.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>late read: 0</p> <p>loading 2...</p>`);

		// revert `a` to 0 in a batch that intersects the pending C — their eventual
		// commit leaves `a` unchanged
		down.click();
		await tick();

		// resolve the pending batches' async-a runs -> they commit a=0
		shift_a.click();
		await tick();
		shift_a.click();
		await tick();
		shift_a.click();
		await tick();
		// the late reader's re-run is still pending; what it showed is still correct
		assert.htmlEqual(target.innerHTML, `${buttons} <p>late read: 0</p> <p>async a: 0</p>`);

		// resolve the late reader's re-run -> it converges on the committed value
		shift_t.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>late read: 0</p> <p>async a: 0</p>`);
	}
});
