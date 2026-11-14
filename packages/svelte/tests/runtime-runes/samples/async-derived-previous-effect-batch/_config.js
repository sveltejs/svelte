import { tick } from 'svelte';
import { test } from '../../test';

// Batch B (x) commits while an earlier batch A (y) is still pending, but B stays around because
// of the async work in the new boundary. While B flushes its effects, an effect creates a new batch C,
// and `d` is computed for the first time afterwards (so it's captured in both B and C). When A
// commits later, it sees B's previous values, which must be consistent (`d` must be `x * 2`).
export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [y, x, shift] = target.querySelectorAll('button');
		assert.deepEqual(logs, [0, 0, 0]);

		// A
		y.click();
		await tick();

		// B
		x.click();
		await tick();
		assert.deepEqual(logs, [0, 0, 0, 0, 1, 2]);

		// A commits
		shift.click();
		await tick();

		for (let i = 0; i < logs.length; i += 3) {
			assert.equal(logs[i + 2], logs[i + 1] * 2, `torn read: ${logs.slice(i, i + 3)}`);
		}

		assert.deepEqual(logs.slice(-3), [1, 1, 2]);
	}
});
