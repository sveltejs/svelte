import { flushSync, tick } from 'svelte';
import { test } from '../../test';

// Two overlapping batches write to `b`. The first one commits first, running effects that read
// `sum` with its own (batch-local) view of `b`. The second one sets `b` back to its original
// value, so `sum` ends up where these effects last saw it outside of any batch-local view —
// they still need to re-run, since what they show is the first batch's view.
export default test({
	mode: ['client'],
	async test({ assert, target, instance }) {
		const [resolve_all, set_1, set_0] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('#output');

		for (let i = 0; i < 3; i++) {
			resolve_all.click();
			await tick();
		}
		assert.htmlEqual(output.innerHTML, '<p>p0|0</p><em>slow0|key0</em>');
		assert.deepEqual(instance.log, [0]);

		set_1.click();
		flushSync();
		set_0.click();

		// the first batch resolves and commits, the second one is still pending
		resolve_all.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>p0|1</p><em>slow0|key1</em>');
		assert.deepEqual(instance.log, [0, 1]);

		for (let i = 0; i < 3; i++) {
			resolve_all.click();
			await tick();
		}
		assert.htmlEqual(output.innerHTML, '<p>p0|0</p><em>slow0|key0</em>');
		assert.deepEqual(instance.log, [0, 1, 0]);
	}
});
