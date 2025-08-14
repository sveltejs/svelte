import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [btn, btn2] = target.querySelectorAll('button');

		flushSync(() => btn.click());
		assert.deepEqual(logs, ['foo', 'baz']);

		flushSync(() => btn2.click());
		assert.deepEqual(logs, ['foo', 'baz', 'foo', 'baz']);
	}
});
