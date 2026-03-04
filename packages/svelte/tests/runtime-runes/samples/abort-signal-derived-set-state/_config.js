import { ok, test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target, errors }) {
		const btn = target.querySelector('button');
		flushSync(() => {
			btn?.click();
		});
		assert.deepEqual(errors, []);
	}
});
