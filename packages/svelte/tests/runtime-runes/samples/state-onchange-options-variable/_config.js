import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [count, raw, object] = target.querySelectorAll('button');

		flushSync(() => count.click());
		flushSync(() => raw.click());
		flushSync(() => object.click());
		assert.deepEqual(logs, ['count', 'count', 'object']);
	}
});
