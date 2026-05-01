import { tick } from 'svelte';
import { test } from '../../test';

// Tests that batch.#commit() does not null out a potentially new current_batch
export default test({
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
