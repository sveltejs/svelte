import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, component, target }) {
		const [btn1] = target.querySelectorAll('button');
		flushSync(() => {
			// This test would result in an infinite loop, so if this doesn't error, then the test is working.
		});
	}
});
