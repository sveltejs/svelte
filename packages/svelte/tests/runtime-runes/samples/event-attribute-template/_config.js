import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, component }) {
		const [b1] = target.querySelectorAll('button');

		flushSync(() => {
			b1?.click();
		});

		await Promise.resolve();
		assert.deepEqual(component.log, ['onclick']);
	}
});
