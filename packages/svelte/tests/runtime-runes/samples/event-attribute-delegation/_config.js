import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [b1] = target.querySelectorAll('button');

		flushSync(() => {
			b1?.click();
		});

		await Promise.resolve();
		assert.deepEqual(logs, [
			'clicked button',
			'clicked div 2',
			'clicked div 1',
			'clicked container'
		]);
	}
});
