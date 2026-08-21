import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const btn = target.querySelector('button');
		flushSync(() => {
			btn?.click();
		});
		assert.deepEqual(logs, ['abort']);
	}
});
