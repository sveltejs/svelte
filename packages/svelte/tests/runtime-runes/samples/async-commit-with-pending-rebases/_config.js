import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>x</button>
	<button>y</button>
	<button>shift x</button>
	<button>shift y</button>
`;

// A batch that commits while it still has work in flight inside a boundary that shows its pending
// snippet (which doesn't block it) rebases the other batches right away, like any commit
export default test({
	async test({ assert, target }) {
		const [x, y, shift_x, shift_y] = target.querySelectorAll('button');

		shift_x.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`${buttons} <p>x: 0</p> <p>x + y: 0</p> <p>loading y...</p>`
		);

		// batch X: waits for `x: 1`
		x.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`${buttons} <p>x: 0</p> <p>x + y: 0</p> <p>loading y...</p>`
		);

		// batch Y: its async work is inside the pending boundary, so it commits right away
		y.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`${buttons} <p>x: 0</p> <p>x + y: 1</p> <p>loading y...</p>`
		);

		// X commits, in a view that includes Y's committed write
		shift_x.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`${buttons} <p>x: 1</p> <p>x + y: 2</p> <p>loading y...</p>`
		);

		shift_y.click();
		await tick();
		shift_y.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>x: 1</p> <p>x + y: 2</p> <p>y: 1</p>`);
	}
});
