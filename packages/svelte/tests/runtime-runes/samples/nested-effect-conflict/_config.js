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
			'top level',
			'inner',
			0,
			'destroy inner',
			undefined,
			'destroy outer',
			undefined
		]);
	}
});
