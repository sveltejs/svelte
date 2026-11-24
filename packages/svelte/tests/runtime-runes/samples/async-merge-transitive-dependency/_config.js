import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>b</button>
	<button>c</button>
	<button>resolve</button>
	<button>resolve last</button>
`;

// B3 (untracked) reads `a` and `b`, which are written by the pending batches B1 and B2. B3 must
// not leak B1's or B2's uncommitted values into the DOM. Batches stay independent: B3 doesn't
// write `a` or `b`, so in its view their writes are undone (a=0, b=0), and it commits on its own
// without waiting for them. B2 then commits without waiting for B1, and B1 commits last
// TODO test feels unnecessary outside of branch async-another-try-pt-1
export default test({
	async test({ assert, target }) {
		const [a, b, c, resolve, resolve_last] = target.querySelectorAll('button');

		resolve.click();
		await tick();
		resolve.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>0</p><p>0:00</p>`);

		a.click(); // B1: slow(a=1) pending
		await tick();
		b.click(); // B2: slow(b=1) pending
		await tick();
		c.click(); // B3: reads a=0 and b=0 in its view (B1/B2 undone) -> commits right away
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>0</p><p>1:00</p>`);

		// B2 finishes first: it commits on its own, without B1's value. The third paragraph
		// isn't re-run, because its reads of `a` and `b` are untracked
		resolve_last.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>1</p><p>1:00</p>`);

		// B1 finishes and commits
		resolve.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><p>1</p><p>1:00</p>`);
	}
});
