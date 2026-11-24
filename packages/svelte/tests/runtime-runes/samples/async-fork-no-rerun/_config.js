import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [change, commit] = target.querySelectorAll('button');

		assert.deepEqual(logs, ['hi']);

		change.click();
		await tick();
		assert.deepEqual(logs, ['hi', 'hi']);

		commit.click();
		await tick();
		assert.deepEqual(logs, ['hi', 'hi']);
	}
});
