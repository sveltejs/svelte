import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [shift] = target.querySelectorAll('button');

		await tick();
		assert.deepEqual(logs, []);

		shift.click();
		await tick();

		assert.deepEqual(logs, ['in effect']);
	}
});
