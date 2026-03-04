import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [btn] = target.querySelectorAll('button');

		btn.click();
		await tick();
		// d should be 10 (real-world: s=1, d=1*10) before commit, not 20 (fork: s=2, d=2*10)
		// After commit, d should be 99 (the written value)
		assert.deepEqual(logs, [10, 99]);
	}
});
