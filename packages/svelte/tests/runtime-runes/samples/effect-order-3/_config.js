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
		assert.deepEqual(logs, [
			'effect',
			0,
			'in-increment',
			1,
			'effect',
			1,
			'in-increment',
			2,
			'effect',
			2
		]);
	}
});
