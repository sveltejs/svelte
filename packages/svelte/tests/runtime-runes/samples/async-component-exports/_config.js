import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [log] = target.querySelectorAll('button');

		log.click();
		assert.deepEqual(logs, ['foo', 'bar']);
	}
});
