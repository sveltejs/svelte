import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [button] = target.querySelectorAll('button');

		button.click();
		await tick();

		assert.deepEqual(logs, ['error: boom', 'boom']);
	}
});
