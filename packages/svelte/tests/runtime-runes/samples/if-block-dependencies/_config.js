import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await Promise.resolve();

		let [btn1] = target.querySelectorAll('button');

		flushSync(() => {
			btn1?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`false\ntrue\n<button>Toggle</button>\nfirst:\nfalse\n<br>\nsecond:\ntrue`
		);
	}
});
