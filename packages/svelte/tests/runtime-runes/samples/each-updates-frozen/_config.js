import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	// TODO: need to force DEV to be false for runtime somehow
	async test({ assert, target, logs }) {
		const [btn1] = target.querySelectorAll('button');

		assert.equal(logs.length, 3);

		logs.length = 0;

		flushSync(() => {
			btn1.click();
		});

		assert.equal(logs.length, 1);
	}
});
