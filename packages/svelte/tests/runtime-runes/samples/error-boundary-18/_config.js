import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		let btn = target.querySelector('button');

		assert.throws(() => {
			flushSync(() => {
				btn?.click();
				btn?.click();
			});
		}, /test\n\n\tin {expression}\n/);
	}
});
