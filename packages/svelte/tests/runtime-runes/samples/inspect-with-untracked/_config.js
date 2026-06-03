import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	async test({ assert, target, logs }) {
		const [a, b] = target.querySelectorAll('button');
		assert.deepEqual(logs, ['init', 0]);
		flushSync(() => {
			b?.click();
		});
		assert.deepEqual(logs, ['init', 0]);
		flushSync(() => {
			a?.click();
		});
		assert.deepEqual(logs, ['init', 0, 'update', 1]);
	}
});
