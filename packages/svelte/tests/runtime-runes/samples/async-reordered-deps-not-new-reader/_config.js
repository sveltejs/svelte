import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>flip</button>
	<button>a</button>
	<button>b</button>
	<button>resolve</button>
`;

// A reaction that reads its existing dependencies in a different order than last time
// is not a "new reader" of those dependencies — it must keep seeing its own batch's view,
// not the latest (uncommitted) value of a later pending batch
export default test({
	async test({ assert, target }) {
		const [flip, a, , resolve] = target.querySelectorAll('button');

		resolve.click();
		await tick();
		resolve.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>a0b0</p><p>true</p><p>a0</p>`);

		flip.click(); // B1: cond = false, slow(cond) pending
		await tick();
		a.click(); // B2: a = 'a1', slow(a) pending
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>a0b0</p><p>true</p><p>a0</p>`);

		// B1 commits while B2 is still pending. The flipped branch reads `b` then `a` (reordered
		// deps) — `a` must still resolve to B1's view (a0), not B2's uncommitted a1
		resolve.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>b0a0</p><p>false</p><p>a0</p>`);

		resolve.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>b0a1</p><p>false</p><p>a1</p>`);
	}
});
