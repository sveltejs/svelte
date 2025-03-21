import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [btn, btn2, btn3] = target.querySelectorAll('button');

		assert.deepEqual(logs, ['constructor count', 'constructor proxy']);

		logs.length = 0;

		flushSync(() => {
			btn.click();
		});
		assert.deepEqual(logs, ['class count']);

		flushSync(() => {
			btn2.click();
		});
		assert.deepEqual(logs, ['class count', 'class proxy']);

		flushSync(() => {
			btn3.click();
		});
		assert.deepEqual(logs, ['class count', 'class proxy', 'class proxy']);
	}
});
