import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target, logs }) {
		const [b1] = target.querySelectorAll('button');
		flushSync(() => {
			b1.click();
		});
		flushSync(() => {
			b1.click();
		});
		assert.deepEqual(logs, ['A', 'B', 'A', 'B', 'A', 'B']);
	}
});
