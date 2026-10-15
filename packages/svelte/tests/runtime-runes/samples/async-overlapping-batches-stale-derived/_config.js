import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>resolve</button><button>set b to 1</button><button>set b to 0</button>';

// Two overlapping batches write to `b`. The first one commits first, running effects that read
// `sum` with its own (batch-local) view of `b`. The second one sets `b` back to its original
// value, so `sum` ends up where these effects last saw it outside of any batch-local view —
// they still need to re-run, since what they show is the first batch's view.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [resolve, set_1, set_0] = target.querySelectorAll('button');

		resolve.click();
		await tick();
		resolve.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>p0|0</p><em>key0</em>`);
		assert.deepEqual(logs, [0]);

		set_1.click();
		await tick();
		set_0.click();
		await tick();

		// the first batch resolves and commits, the second one is still pending
		resolve.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>p0|1</p><em>key1</em>`);
		assert.deepEqual(logs, [0, 1]);

		resolve.click();
		await tick();
		resolve.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>p0|0</p><em>key0</em>`);
		assert.deepEqual(logs, [0, 1, 0]);
	}
});
