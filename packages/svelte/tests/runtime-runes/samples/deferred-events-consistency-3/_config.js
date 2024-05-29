import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [b1] = target.querySelectorAll('button');
		b1.click();
		flushSync();

		// TODO: this should likely be ['works'], as if we don't use spread this works as intended
		assert.deepEqual(logs, ['fails']);
	}
});
