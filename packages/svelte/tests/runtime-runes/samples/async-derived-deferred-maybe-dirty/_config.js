import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>b</button>
	<button>resolve a</button>
	<button>resolve b</button>
`;

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [a, b, resolve_a, resolve_b] = target.querySelectorAll('button');
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0:0</p><p>0</p>`);

		// sum is DIRTY and doubled is MAYBE_DIRTY, but neither runs while a is pending.
		a.click();
		await tick();

		// The if block evaluates both deriveds with the latest inputs and marks them clean.
		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0:0</p><p>0</p>`);

		// The earlier batch must restore doubled's MAYBE_DIRTY status as well as sum's
		// DIRTY status, otherwise it reuses the cached value from before a changed.
		resolve_a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1:2</p><p>0</p>`);

		resolve_b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1:4</p><p>1</p><span>ready</span>`);
	}
});
