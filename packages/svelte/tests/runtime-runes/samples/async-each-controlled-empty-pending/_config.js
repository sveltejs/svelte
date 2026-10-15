import { tick } from 'svelte';
import { test } from '../../test';

// Regression for #18610: emptying a controlled keyed {#each} while another
// batch is still pending must not take the fast path that clears state.items
// before destroy_effects walks pending keys.
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();

		const [startA, startB, settleB, settleA] = target.querySelectorAll('button');

		// Batch A: add key 9, then blocks on gate A.
		startA.click();
		await tick();

		// Batch B: empty the collection, then block on gate B.
		startB.click();
		await tick();

		// Settle B first so B commits while A is still pending.
		// Should not take the fast path in each block to clear state.items prematurely.
		settleB.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>startA</button>
				<button>startB</button>
				<button>settleB</button>
				<button>settleA</button>
				<p>A0/B0</p>
				<div><span>1</span><span>2</span></div>
			`
		);

		// Settle A so empty array of B can be committed
		settleA.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>startA</button>
				<button>startB</button>
				<button>settleB</button>
				<button>settleA</button>
				<p>A1/B1</p>
				<div></div>
			`
		);
	}
});
