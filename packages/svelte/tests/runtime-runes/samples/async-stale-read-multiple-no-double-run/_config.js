import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `<button>a</button><button>bc</button><button>resolve</button>`;

// An effect that runs in an earlier batch and reads _several_ values that a later batch
// holds newer versions of must only be re-run once when it has to catch up with that
// later batch, not once per value
export default test({
	async test({ assert, target, logs }) {
		const [a, bc, resolve] = target.querySelectorAll('button');

		resolve.click();
		await tick();
		resolve.click();
		await tick();
		resolve.click();
		await tick();
		assert.deepEqual(logs, ['0/0/0']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>0</p><p>0/0/0</p>`);

		// B1: a++ -> `sa` pending
		a.click();
		await tick();
		assert.deepEqual(logs, ['0/0/0']);

		// B2: b++, c++ -> `slow(b + c)` pending, `track` re-runs with B2's view
		bc.click();
		await tick();
		assert.deepEqual(logs, ['0/0/0', '0/1/1']);

		// resolve `sa` in B1: `track` re-runs in B1 (reading B1's view of b/c, without B2's
		// writes). Batches are independent: B2 doesn't see B1's `sa`, so nothing re-runs in B2
		resolve.click();
		await tick();
		assert.deepEqual(logs, ['0/0/0', '0/1/1', '1/0/0']);

		// resolve `slow(b + c)` in B2: B2 is still waiting for its `track`
		resolve.click();
		await tick();
		assert.deepEqual(logs, ['0/0/0', '0/1/1', '1/0/0']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>0</p><p>0/0/0</p>`);

		// resolve `track` in B2: B2 commits on its own (a = 0, b = c = 1). B1's `track` run
		// read two values that B2 now committed newer versions of, so it re-runs in B1 exactly once
		resolve.click();
		await tick();
		assert.deepEqual(logs, ['0/0/0', '0/1/1', '1/0/0', '1/1/1']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>2</p><p>0/1/1</p>`);

		for (let i = 0; i < 6; i++) {
			resolve.click();
			await tick();
		}
		assert.deepEqual(logs, ['0/0/0', '0/1/1', '1/0/0', '1/1/1']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><p>2</p><p>1/1/1</p>`);
	}
});
