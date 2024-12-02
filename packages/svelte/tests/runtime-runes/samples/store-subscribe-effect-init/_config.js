import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>increment</button>`,

	test({ assert, target, logs }) {
		const btn = target.querySelector('button');

		assert.deepEqual(logs, [1]);

		btn?.click();
		flushSync();
		assert.deepEqual(logs, [1, 2]);

		btn?.click();
		flushSync();
		assert.deepEqual(logs, [1, 2, 3]);
	}
});
