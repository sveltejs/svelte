import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [fork, increment, commit] = target.querySelectorAll('button');

		fork.click();
		await tick();

		increment.click();
		await tick();
		assert.deepEqual(logs, []);

		commit.click();
		await tick();
		assert.deepEqual(logs, ['ran']);
	}
});
