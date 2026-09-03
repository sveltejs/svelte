import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [count, items] = target.querySelectorAll('button');

		flushSync(() => count.click());
		assert.deepEqual(logs, ['count', 20]);
		assert.htmlEqual(count.innerHTML, '10');

		logs.length = 0;
		flushSync(() => items.click());
		assert.deepEqual(logs, ['items', 3]);
		assert.htmlEqual(items.innerHTML, '2');
	}
});
