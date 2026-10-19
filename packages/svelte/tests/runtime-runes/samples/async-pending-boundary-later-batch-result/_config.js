import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>show</button>
	<button>shift b</button>
	<button>shift p</button>
	<button>shift q</button>
`;

// A boundary that shows its pending snippet can be done with a result of a batch other than the one that
// created its content (the latest run of an expression supersedes the others there). It only shows that
// result once that batch commits it — for an `await` in the template (p), and in a component's script (q)
export default test({
	async test({ assert, target }) {
		const [a, show, shift_b, shift_p, shift_q] = target.querySelectorAll('button');

		shift_b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 0</p>`);

		// batch 1: shows the other boundaries, whose content is pending -> 1 commits
		show.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`${buttons} <p>b: 0</p> <p>loading p...</p> <p>loading q...</p>`
		);

		// batch 2: waits for `b: 1`. Its runs of `push('p', a)` and `push('q', a)` supersede 1's
		a.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`${buttons} <p>b: 0</p> <p>loading p...</p> <p>loading q...</p>`
		);

		// 1's runs are obsolete, 2's resolve — but 2 hasn't committed yet because the async deriveds wait for 1's completion
		shift_p.click();
		await tick();
		shift_p.click();
		await tick();
		shift_q.click();
		await tick();
		shift_q.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`${buttons} <p>b: 0</p> <p>loading p...</p> <p>loading q...</p>`
		);

		// 2 commits
		shift_b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>b: 1</p> <p>p: 1</p> <p>q: 1</p>`);
	}
});
