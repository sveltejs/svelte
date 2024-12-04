import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	test({ assert, target, logs }) {
		const b1 = target.querySelector('button');
		b1?.click();
		flushSync();
		b1?.click();
		flushSync();

		assert.deepEqual(logs, [
			{ count: { current: 0 } },
			{ count: { current: 1 } },
			{ count: { current: 2 } }
		]);
	}
});
