import { tick } from 'svelte';
import { test } from '../../test';

// An update during the initial awaits must survive their resolution:
// `held` must become 1 after `slow(1)` resolves, producing `one 1`.
export default test({
	mode: ['client'],
	async test({ assert, target, instance, logs }) {
		// still waiting on `slow(0)`
		await tick();
		instance.bump();
		await tick();
		assert.deepEqual(logs, [0, 1]);

		instance.resolve();
		await tick();
		await tick();
		await new Promise((r) => setTimeout(r, 10));

		assert.htmlEqual(target.innerHTML, `<p>one 1</p>`);
		assert.deepEqual(logs, [0, 1]);
	}
});
