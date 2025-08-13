import { ok, test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	compileOptions: {
		hmr: true,
		compatibility: {
			componentApi: 4
		}
	},

	async test({ assert, target, logs }) {
		const btn = target.querySelector('button');
		btn?.click();

		assert.deepEqual(logs, ['event']);
	}
});
