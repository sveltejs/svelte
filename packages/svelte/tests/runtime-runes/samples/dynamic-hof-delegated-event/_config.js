import { flushSync } from 'svelte';
import { test, ok } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [btn1, btn2, btn3] = target.querySelectorAll('button');

		flushSync(() => {
			btn1.click();
			btn2.click();
		});

		assert.deepEqual(logs, ['AA', 'AB']);

		flushSync(() => {
			btn3.click();
			btn1.click();
			btn2.click();
		});

		assert.deepEqual(logs, ['AA', 'AB', 'BA', 'BB']);
	}
});
