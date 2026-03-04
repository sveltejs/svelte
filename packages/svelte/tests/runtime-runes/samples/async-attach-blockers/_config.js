import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],
	async test({ assert, logs }) {
		await tick();

		assert.deepEqual(logs, ['ready', 'ready']);
	}
});
