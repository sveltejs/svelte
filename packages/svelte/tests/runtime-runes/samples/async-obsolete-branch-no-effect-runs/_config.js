import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs, warnings }) {
		const [increment, resolve] = target.querySelectorAll('button');

		increment.click();
		await tick();
		assert.deepEqual(logs, []);

		resolve.click();
		await tick();
		assert.deepEqual(logs, []);

		resolve.click();
		await tick();
		assert.deepEqual(logs, []);

		resolve.click();
		await tick();
		assert.deepEqual(logs, [1, 2]);

		// no await waterfall / inert derived warnings
		assert.deepEqual(warnings, []);
	}
});
