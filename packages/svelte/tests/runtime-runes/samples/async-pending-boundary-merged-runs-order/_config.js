import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>c</button>
	<button>shift p</button>
	<button>pop p</button>
	<button>shift q</button>
`;

// Two batches re-run an async expression inside a boundary that shows its pending snippet, one after the other,
// and each commits while its run is in flight. The run of the second one saw the (committed) writes of the first
// one, and supersedes its run (see `Batch#release_records`): that one's result doesn't overwrite it, even if it
// resolves later
export default test({
	async test({ assert, target, logs }) {
		const [a, c, shift_p, pop_p, shift_q] = target.querySelectorAll('button');

		// the first value of `p`. `q` keeps the boundary pending
		shift_p.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>loading...</p>`);

		// batch A re-runs `p`, and commits (its run is inside the pending boundary)
		a.click();
		await tick();

		// batch C re-runs `p` with A's write, and commits, too: its run supersedes A's
		c.click();
		await tick();
		assert.deepEqual(logs, ['p 0', 'q 0', 'p 1', 'p 2']);

		// C's run resolves first, then A's
		pop_p.click();
		await tick();
		shift_p.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>loading...</p>`);

		shift_q.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>p: 2</p> <p>q: 0</p>`);
	}
});
