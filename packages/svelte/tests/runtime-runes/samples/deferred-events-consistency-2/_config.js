import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [b1] = target.querySelectorAll('button');
		b1.click();
		await tick();

		// TODO this test needs to be moved to runtime-browser, because jsdom seems to synchronously dispatch the submit event
		// after the click event, which is not the case in a real browser.
		assert.deepEqual(logs, ['http://localhost:3000/new%20url']);
	}
});
