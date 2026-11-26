import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [btn] = target.querySelectorAll('button');

		btn.click();
		await tick();
		assert.deepEqual(logs, [10]);

		btn.click();
		await tick();
		assert.deepEqual(logs, [10, 10]);
	}
});
