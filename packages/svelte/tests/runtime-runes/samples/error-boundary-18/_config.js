import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	skip: true, // TODO unskip once tagged values are in and we can fix this properly

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
