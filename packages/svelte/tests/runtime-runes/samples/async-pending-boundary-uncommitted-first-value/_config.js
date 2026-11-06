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

// A boundary that shows its pending snippet can be done with a result of a batch other than the one that
// created its content, when the creator's run was superseded. It only shows that result once that batch
// commits it
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

		// batch 2: its run of `push('p', a + c)` is inside the pending boundary, too, so 2 commits right
		// away, and its run supersedes 1's
		c.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p> <p>loading p...</p>`);

		// batch 3: waits for `b: 1`
		a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p> <p>loading p...</p>`);

		// 3's run resolves first, then 1's (obsolete) and 2's. So 3's result is the first value,
		// which 3 hasn't committed yet
		pop_p.click();
		await tick();
		shift_p.click();
		await tick();
		shift_p.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p> <p>loading p...</p>`);

		// 3 commits
		shift_b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 1</p> <p>p: 2</p>`);
	}
});
