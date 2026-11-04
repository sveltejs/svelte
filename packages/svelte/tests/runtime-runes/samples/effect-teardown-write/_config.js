import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target, logs }) {
		const [button] = target.querySelectorAll('button');

		flushSync(() => button.click());
		assert.deepEqual(logs, [-1, -2]);
	}
});
