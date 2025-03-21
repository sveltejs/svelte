import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [btn, btn2, btn3, btn4] = target.querySelectorAll('button');

		flushSync(() => btn.click());
		assert.deepEqual(logs, ['a']);

		flushSync(() => btn2.click());
		assert.deepEqual(logs, ['a', 'b', 'c']);
		flushSync(() => btn3.click());
		assert.deepEqual(logs, ['a', 'b', 'c', 'b', 'c']);
		flushSync(() => btn4.click());
		assert.deepEqual(logs, ['a', 'b', 'c', 'b', 'c', 'c']);
		flushSync(() => btn2.click());
		assert.deepEqual(logs, ['a', 'b', 'c', 'b', 'c', 'c', 'b']);
	}
});
