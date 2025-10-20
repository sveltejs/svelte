import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const button = target.querySelector('button');

		button?.click();
		flushSync();
		assert.deepEqual(logs, ['pre', 'running b', 'pre', 'pre']);
	}
});
