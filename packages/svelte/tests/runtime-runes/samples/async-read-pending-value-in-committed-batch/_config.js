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

		// batch C: writes a=1; the async-a effect re-runs in C. That's inside boundary 2, which shows
		// its pending snippet, so C commits (and stays live until the run resolves)
		up.click();
		await tick();

		// A's continuation first-reads `a`. C's write is committed, so it's part of A's view, too:
		// the reader sees 1, and boundary 1 resolves with it
		shift_t.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>late read: 1</p> <p>loading 2...</p>`);

		// batch D: writes a=0. The late reader re-runs in D (and re-awaits a fresh deferred), which
		// holds D back — boundary 1 is shown now
		down.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>late read: 1</p> <p>loading 2...</p>`);

		// resolve the async-a runs (B's and C's were superseded by D's)
		shift_a.click();
		await tick();
		shift_a.click();
		await tick();
		shift_a.click();
		await tick();
		// batch-views: boundary 2 shows D's result before D commits (a pending boundary resolves as
		// soon as its work is done, and B, which created it, renders it — see batch-views.md, "Known bugs
		// and gaps"). It should still show `loading 2...`
		assert.htmlEqual(target.innerHTML, `${buttons} <p>late read: 1</p> <p>async a: 0</p>`);

		// resolve the late reader's re-run -> D commits
		shift_t.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>late read: 0</p> <p>async a: 0</p>`);
	}
});
