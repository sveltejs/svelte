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

		// batch B: reveals boundary 1 -> commits with pending snippet, stays live
		show1.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>loading 1...</p>`);

		// batch C: reveals boundary 2 -> commits with pending snippet, stays live
		show2.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>loading 1...</p> <p>loading 2...</p>`);

		// batch A: writes a=1; the async-a effect is owned by C, so A merges with
		// C and stays pending. B remains separate
		up.click();
		await tick();

		// B's continuation first-reads `a`, which is overlaid by the pending
		// merged batch. B has already committed its UI, so it cannot entangle —
		// it reads the latest value (1) instead
		shift_t.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>late read: 1</p> <p>loading 2...</p>`);

		// revert `a` to 0 inside the pending batch — its eventual commit leaves
		// `a` unchanged. The write re-runs the late reader (it acquired `a` as a
		// dependency), so it re-awaits a fresh deferred
		down.click();
		await tick();

		// resolve the pending batch's async-a runs -> it commits
		shift_a.click();
		await tick();
		shift_a.click();
		await tick();
		shift_a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>late read: 1</p> <p>async a: 0</p>`);

		// resolve the late reader's re-run -> it converges on the committed value
		shift_t.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>late read: 0</p> <p>async a: 0</p>`);
	}
});
