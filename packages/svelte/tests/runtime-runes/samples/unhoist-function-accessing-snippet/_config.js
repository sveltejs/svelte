import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, errors }) {
		const button = target.querySelector('button');
		flushSync(() => {
			button?.click();
		});
		assert.deepEqual(errors, []);
	}
});
