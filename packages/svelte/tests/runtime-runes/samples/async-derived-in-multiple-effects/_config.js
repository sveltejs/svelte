import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const button = target.querySelector('button');

		button?.click();
		await tick();
		// TODO this is wrong: it should be [5]
		assert.deepEqual(logs, [4]);

		button?.click();
		await tick();
		// TODO this is wrong: it should be [5, 7]
		assert.deepEqual(logs, [4, 7]);
	}
});
