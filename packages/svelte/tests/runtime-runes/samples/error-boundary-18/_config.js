import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		let btn = target.querySelector('button');

		btn?.click();
		btn?.click();

		assert.throws(() => {
			flushSync();
		}, /test\n\n\tin {expression}\n/);
	}
});
