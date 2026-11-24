import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		target.querySelector('button')?.click();
		await tick();
		assert.deepEqual(logs, ['show', true, 'show', true]);
	}
});
