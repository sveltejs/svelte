import { tick } from 'svelte';
import { test } from '../../test';

// Tests that batch.#commit() does not null out a potentially new current_batch
export default test({
	skip_initial_flushSync: true, // test that the initial batch is flushed without an explicit flushSync() call
	async test({ assert, target }) {
		await tick();

		const [button] = target.querySelectorAll('button');
		const [updates] = target.querySelectorAll('p');

		assert.htmlEqual(updates.innerHTML, 'false');

		button.click();
		await tick();
		assert.htmlEqual(updates.innerHTML, 'true');
	}
});
