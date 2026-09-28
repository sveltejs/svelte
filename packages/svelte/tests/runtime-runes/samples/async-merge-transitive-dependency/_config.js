import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>b</button>
	<button>c</button>
	<button>resolve</button>
	<button>resolve last</button>
`;

// B3 reads values held by both B1 and B2 and therefore depends on both. When B3 merges
// into B2 (the nearest earlier related batch), B2 must inherit B3's dependency on B1,
// otherwise B2+B3 commit before B1 and leak B1's uncommitted value into the DOM
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
		c.click(); // B3: reads a=1 (held by B1) and b=1 (held by B2) -> depends on both, merges into B2
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>0</p><p>0:00</p>`);

		// B2 finishes first: it must still wait for B1
		resolve_last.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>0</p><p>0:00</p>`);

		// B1 finishes: everything commits together
		resolve.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><p>1</p><p>1:11</p>`);
	}
});
