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

// Batches that re-run an async expression inside a boundary that shows its pending snippet merge into the
// batch that created it (it committed, but stays live until its run resolves): their runs supersede the
// creator's, and the creator shows the result in its view. A blocked batch's run doesn't supersede the others
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

		// batch 2: re-runs `push('p', a + c)`, which 1 ran, so it intersects with 1 (see `Batch#intersects`).
		// Its run is inside the pending boundary, so 2 is done right away, and merges into 1
		c.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p> <p>loading p...</p>`);

		// batch 3: waits for `b: 1`. It intersects with 1, too: its view includes c = 1
		a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p> <p>loading p...</p>`);

		// 3's run resolves first, then 1's (superseded by 2's) and 2's. 1 shows 2's result
		pop_p.click();
		await tick();
		shift_p.click();
		await tick();
		shift_p.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p> <p>p: 1</p>`);

		// 3 commits
		shift_b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 1</p> <p>p: 2</p>`);
	}
});
