import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>c</button>
	<button>show</button>
	<button>shift b</button>
	<button>shift p</button>
	<button>pop p</button>
`;

// Like `async-pending-boundary-uncommitted-first-value`, but the batch that hasn't committed runs the expression
// before the batch whose committed run supersedes the creator's. The boundary still shows the committed batch's
// result, not the result of the batch that hasn't committed (whose writes would show before it commits)
export default test({
	async test({ assert, target }) {
		const [a, c, show, shift_b, shift_p, pop_p] = target.querySelectorAll('button');

		shift_b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p>`);

		// batch 1: shows the boundary, whose content is pending -> 1 commits
		show.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p> <p>loading p...</p>`);

		// batch 3: waits for `b: 1`, and runs the expression with a = 1
		a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p> <p>loading p...</p>`);

		// batch 2: its view undoes 3's write, so its run reads a = 0. It's done right away (its run is inside
		// the pending boundary), and commits: its run supersedes 1's. 3 runs the expression again, with c = 1
		c.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p> <p>loading p...</p>`);

		// 3's latest run resolves first, then 1's (superseded) and 3's first one (obsolete)
		pop_p.click();
		await tick();
		shift_p.click();
		await tick();
		shift_p.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p> <p>loading p...</p>`);

		// 2's run: the real world's
		shift_p.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p> <p>p: 0/1</p>`);

		// 3 commits
		shift_b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 1</p> <p>p: 1/1</p>`);
	}
});
