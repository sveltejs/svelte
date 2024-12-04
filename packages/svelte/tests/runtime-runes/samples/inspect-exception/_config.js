import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, logs }) {
		const b1 = target.querySelector('button');
		b1?.click();
		flushSync();

		assert.deepEqual(logs, ['init', 'a', 'init', 'b']);
	}
});
