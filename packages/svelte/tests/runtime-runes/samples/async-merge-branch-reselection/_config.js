import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>start A: x = 1</button>
	<button>start B: show branch</button>
	<button>resolve A</button>
`;

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [start_a, start_b, resolve] = target.querySelectorAll('button');

		start_a.click();
		await tick();
		start_b.click();
		await tick();

		// B selected the empty branch before merging into A. A's async result
		// now selects the content, which B's old commit callback must not remove.
		// The two blocks register A's and B's callbacks in opposite orders.
		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`${buttons}<p>1/1</p><strong>ready</strong><em>also ready</em>`
		);
	}
});
