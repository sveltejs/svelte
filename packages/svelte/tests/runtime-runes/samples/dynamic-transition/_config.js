import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [b1, b2] = target.querySelectorAll('button');

		flushSync(() => {
			b1.click();
		});

		assert.deepEqual(logs, ['transition 2']);

		flushSync(() => {
			b2.click();
		});

		assert.deepEqual(logs, ['transition 2']);

		flushSync(() => {
			b1.click();
		});

		assert.deepEqual(logs, ['transition 2', 'transition 1']);
	}
});
