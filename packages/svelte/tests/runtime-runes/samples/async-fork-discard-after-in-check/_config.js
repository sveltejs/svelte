import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();

		const [rerun, discard] = target.querySelectorAll('button');

		rerun.click();
		await tick();

		discard.click();
		await tick();

		assert.deepEqual(logs, [1, false, 1, 1, 1]);
	}
});
