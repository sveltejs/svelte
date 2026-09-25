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
		// The later batch finishes first but should not commit; it overlaps with the earlier batch through a block.
		// If we were to commit this batch we would briefly see an if block's truthy branch, which is wrong considering
		// the "timeline applied in order" principle.
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
