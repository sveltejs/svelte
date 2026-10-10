import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `<button>a</button><button>bc</button><button>resolve</button>`;

// An effect that runs in an earlier batch and reads _several_ values that a later batch
// holds newer versions of must only be re-run once in that later batch, not once per value
export default test({
	async test({ assert, target, instance }) {
		const [a, bc, resolve] = target.querySelectorAll('button');

		resolve.click();
		await tick();
		resolve.click();
		await tick();
		resolve.click();
		await tick();
		assert.deepEqual(instance.get_calls(), ['0/0/0']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>0</p><p>0/0/0</p>`);

		// B1: a++ -> `sa` pending
		a.click();
		await tick();
		assert.deepEqual(instance.get_calls(), ['0/0/0']);

		// B2: b++, c++ -> `slow(b + c)` pending, `track` re-runs with B2's view
		bc.click();
		await tick();
		assert.deepEqual(instance.get_calls(), ['0/0/0', '0/1/1']);

		// resolve `sa` in B1: `track` re-runs in B1 (reading B1's stale view of b/c) and,
		// because it read two values held by B2, exactly once more in B2
		resolve.click();
		await tick();
		assert.deepEqual(instance.get_calls(), ['0/0/0', '0/1/1', '1/0/0', '1/1/1']);

		for (let i = 0; i < 6; i++) {
			resolve.click();
			await tick();
		}
		assert.deepEqual(instance.get_calls(), ['0/0/0', '0/1/1', '1/0/0', '1/1/1']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><p>2</p><p>1/1/1</p>`);
	}
});
