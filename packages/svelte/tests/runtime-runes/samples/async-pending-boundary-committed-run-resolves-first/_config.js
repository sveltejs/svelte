import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>show</button>
	<button>shift b</button>
	<button>shift p</button>
	<button>pop p</button>
`;

// Like `async-pending-boundary-committed-run-supersedes`, but the run of the batch that committed resolves
// before the earlier batch commits. Its view undoes the earlier batch's write, so its run read a = 0, and the
// earlier batch's a = 1: the boundary shows the earlier batch's result once that batch commits
export default test({
	async test({ assert, target }) {
		const [a, show, shift_b, shift_p] = target.querySelectorAll('button');

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

		// B's run resolves. The boundary still waits for X's run
		shift_p.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p> <p>loading p...</p>`);

		// X commits
		shift_b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 1</p> <p>loading p...</p>`);

		// X's run resolves
		shift_p.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 1</p> <p>p: 1</p>`);
	}
});
