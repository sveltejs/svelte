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

// A batch that is merged into another one, whose run of an async expression inside a boundary that shows its
// pending snippet supersedes that batch's run, hands over its pending work, too: here, the batch it's merged into
// has no other pending work, so it would be done once its own run is superseded, and Y's result would arrive in a
// batch that nobody processes anymore
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

		// batch Y re-runs `p`, which X ran, so it intersects with X (see `Batch#intersects`), and merges into it
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
