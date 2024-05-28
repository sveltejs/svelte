import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [b1] = target.querySelectorAll('button');
		b1.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
		// The browser will yield a microtask between events
		await Promise.resolve();
		b1.click();
		flushSync();

		assert.deepEqual(logs, []);
	}
});
