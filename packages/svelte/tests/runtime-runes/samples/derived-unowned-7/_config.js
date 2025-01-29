import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		let [btn1] = target.querySelectorAll('button');

		flushSync(() => {
			btn1.click();
		});

		assert.deepEqual(logs, ['computing C', 'computing B', 'a', 'foo', 'computing B', 'aaa', 'foo']);
	}
});
