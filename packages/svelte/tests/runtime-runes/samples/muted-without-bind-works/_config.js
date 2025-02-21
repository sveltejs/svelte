import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const btn = target.querySelector('button');
		ok(btn);
		flushSync(() => {
			btn.click();
		});
		assert.deepEqual(logs, [true]);
	}
});
