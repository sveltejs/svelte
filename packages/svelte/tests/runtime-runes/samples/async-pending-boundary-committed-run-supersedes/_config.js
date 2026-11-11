import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>show</button>
	<button>shift b</button>
	<button>shift p</button>
	<button>pop p</button>
`;

// A batch that committed while its run of an async expression inside a pending boundary was in flight
// holds no run of it anymore. Once another batch commits a run of it, that run supersedes the batch's.
// Here, the other batch is the earlier one. The later one committed before it, so it doesn't intersect with
// it (although both ran the expression, see `Batch#intersects`), and nothing is merged
export default test({
	async test({ assert, target }) {
		const [a, show, shift_b, shift_p, pop_p] = target.querySelectorAll('button');

		shift_b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p>`);

		// batch X: blocked by `b`
		a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p>`);

		// batch B (later than X): creates the pending boundary. Its view undoes X's write, so its run reads
		// a = 0. B commits, and X runs the expression, too (with a = 1)
		show.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p> <p>loading p...</p>`);

		// X commits, and so does its run of the expression (which is still pending)
		shift_b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 1</p> <p>loading p...</p>`);

		// X's run resolves
		pop_p.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 1</p> <p>p: 1</p>`);

		// B's run was superseded: its result doesn't overwrite X's
		shift_p.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 1</p> <p>p: 1</p>`);
	}
});
