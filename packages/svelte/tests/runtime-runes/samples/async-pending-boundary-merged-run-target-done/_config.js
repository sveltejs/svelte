import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>c</button>
	<button>show</button>
	<button>shift p</button>
	<button>pop p</button>
	<button>shift q</button>
`;

// Two batches re-run an async expression inside a boundary that shows its pending snippet, and commit while their
// runs are in flight. The later one's committed run supersedes the earlier one's (see `Batch#release_records`),
// which then has no pending work left, and is done. The later one stays live until its run resolves, so its
// result arrives in a batch that is still processed, and the boundary shows it
export default test({
	async test({ assert, target, logs }) {
		const [a, c, show, shift_p, pop_p, shift_q] = target.querySelectorAll('button');

		// another batch's `q` keeps the boundary pending, after `p`'s first value is there
		show.click();
		await tick();
		shift_p.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>loading...</p>`);

		// batch X re-runs `p`. It's done right away (the run is inside the pending boundary), and commits
		a.click();
		await tick();

		// batch Y re-runs `p` (with X's committed write), and commits, too: its run supersedes X's
		c.click();
		await tick();
		assert.deepEqual(logs, ['p 0', 'q 0', 'p 1', 'p 2']);

		// Y's run resolves, then X's (superseded) one
		pop_p.click();
		await tick();
		shift_p.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>loading...</p>`);

		shift_q.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>q: 0</p> <p>p: 2</p>`);
	}
});
