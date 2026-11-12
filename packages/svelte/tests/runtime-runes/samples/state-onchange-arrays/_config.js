import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [btn, btn2, btn3] = target.querySelectorAll('button');

		flushSync(() => btn.click());
		assert.deepEqual(logs, ['arr']);

		flushSync(() => btn2.click());
		assert.deepEqual(logs, ['arr', 'arr']);

		flushSync(() => btn3.click());
		assert.deepEqual(logs, ['arr', 'arr', 'arr']);
	}
});
