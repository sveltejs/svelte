import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, logs }) {
		await tick();
		assert.deepEqual(logs, ['hello']);
	}
});
