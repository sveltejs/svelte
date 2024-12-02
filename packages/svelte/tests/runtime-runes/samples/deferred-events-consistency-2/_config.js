import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	// currently not testable in our test suide: click() will synchronously call submit which is not the case in a real browser
	// (moving this test to runtime-browser doesn't help either for some reason)
	skip: true,

	async test({ assert, target, logs }) {
		const [b1] = target.querySelectorAll('button');
		b1.click();
		flushSync();

		assert.deepEqual(logs, ['http://localhost:3000/new%20url']);
	}
});
