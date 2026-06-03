import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target, logs }) {
		const [increment, toggle] = target.querySelectorAll('button');

		flushSync(() => toggle.click());
		assert.deepEqual(logs, [0, 'hello']);

		flushSync(() => toggle.click());
		flushSync(() => increment.click());
		flushSync(() => increment.click());

		assert.deepEqual(logs, [0, 'hello', 1, 'hello']);
	}
});
