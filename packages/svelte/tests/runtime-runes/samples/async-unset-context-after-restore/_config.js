import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, logs }) {
		await new Promise((resolve) => setTimeout(resolve, 10));
		assert.deepEqual(logs, [1, 1]);
		const [button] = document.querySelectorAll('button');

		button.click();
		await tick();
		assert.deepEqual(logs, [1, 1, 2]);
	}
});
