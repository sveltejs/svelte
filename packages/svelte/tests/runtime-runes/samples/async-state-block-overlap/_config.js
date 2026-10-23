import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();

		const [a, b, _, pop] = target.querySelectorAll('button');

		a.click();
		await tick();

		b.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>a</button>
			<button>b</button>
			<button>shift</button>
			<button>pop</button>
			0 0 bye
		`
		);

		pop.click();
		await tick();
		// The later batch (b++) finishes first. It overlaps with the earlier, still-pending batch (a++)
		// only through the if block, which reads both. Batches are independent: the later batch saw
		// `a` without the earlier batch's write, so it commits on its own and shows its consistent
		// view of the world (a = 0, b = 1), in which the if block's truthy branch is selected.
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>a</button>
			<button>b</button>
			<button>shift</button>
			<button>pop</button>
			0 1 hello
		`
		);

		// The earlier batch now finishes and commits on top of the later one (a = 1, b = 1)
		pop.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>a</button>
			<button>b</button>
			<button>shift</button>
			<button>pop</button>
			1 1 bye
		`
		);
	}
});
