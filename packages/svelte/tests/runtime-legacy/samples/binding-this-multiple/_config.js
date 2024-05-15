import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, logs }) {
		const [b1, b2, b3] = target.querySelectorAll('button');
		const first_h1 = target.querySelector('h1');

		assert.deepEqual(logs, [undefined, first_h1]);

		flushSync(() => {
			b3.click();
		});

		const third_h1 = target.querySelector('h1');

		assert.deepEqual(logs, [undefined, first_h1, third_h1]);

		flushSync(() => {
			b1.click();
		});

		assert.deepEqual(logs, [undefined, first_h1, third_h1, target.querySelector('h1')]);
	}
});
