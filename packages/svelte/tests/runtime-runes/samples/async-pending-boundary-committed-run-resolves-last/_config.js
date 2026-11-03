import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>show</button>
	<button>c</button>
	<button>shift b</button>
	<button>shift p</button>
	<button>pop p</button>
`;

// Like `async-pending-boundary-committed-run-resolves-first`, but the earlier batch's run resolves first. Then
// both batches hold their own result of the expression. The batch that committed must not be merged into the
// earlier one because of that (its run didn't see the earlier batch's writes), and its result mustn't replace
// the earlier batch's, which commits its own result next to its own writes
export default test({
	// batch-views: the batch that committed shares the derived's signal with the earlier batch, and is merged into
	// it, replacing its result (see "A committed batch's own results make it intersect" in batch-views.md)

	async test({ assert, target }) {
		const [a, show, c, shift_b, shift_p, pop_p] = target.querySelectorAll('button');

		shift_b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p>`);

		// batch X: blocked by `b`
		a.click();
		await tick();

		// batch B: creates the pending boundary, its run reads a = 0. B commits, and X runs the expression with a = 1
		show.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p> <p>loading p...</p>`);

		// X's run resolves. The boundary still waits for B's run
		pop_p.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p> <p>loading p...</p>`);

		// B's run resolves: the boundary shows the real world's result
		shift_p.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p> <p>p: 0 c: 0</p>`);

		// an unrelated batch: its view undoes X's writes, including X's result
		c.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p> <p>p: 0 c: 1</p>`);

		// X commits, with its own result
		shift_b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 1</p> <p>p: 1 c: 1</p>`);
	}
});
