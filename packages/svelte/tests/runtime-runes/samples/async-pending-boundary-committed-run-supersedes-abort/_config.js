import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>show</button>
	<button>shift b</button>
	<button>shift p</button>
`;

// Like `async-pending-boundary-committed-run-supersedes`, but the superseded run was aborted (and so never
// settles on its own): the boundary doesn't keep showing its pending snippet
export default test({
	async test({ assert, target, logs }) {
		const [a, show, shift_b, shift_p] = target.querySelectorAll('button');

		shift_b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p>`);

		a.click();
		await tick();

		show.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p> <p>loading p...</p>`);
		// B's run was aborted when X re-ran the expression
		assert.ok(logs.includes('aborted p 0'));

		shift_b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 1</p> <p>loading p...</p>`);

		// X's run (B's was aborted, so this is the only one left)
		shift_p.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 1</p> <p>p: 1</p>`);
	}
});
