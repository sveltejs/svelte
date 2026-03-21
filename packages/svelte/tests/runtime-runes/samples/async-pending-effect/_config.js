import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		// This test causes two batches to be scheduled such that the same root is traversed multiple times,
		// some of the time while it was already marked clean by a previous batch processing. It tests
		// that the app stays reactive after, i.e. that the root is not improperly marked as unclean.
		await tick();
		const [button] = target.querySelectorAll('button');

		button.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>toggle</button><p>hello</p>`);
	}
});
