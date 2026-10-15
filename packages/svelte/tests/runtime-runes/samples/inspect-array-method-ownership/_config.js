import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	test({ assert, target, logs }) {
		const [splice, delete_and_splice] = target.querySelectorAll('button');

		flushSync(() => splice.click());
		assert.deepEqual(logs.splice(0), ['init', [1, 2, 3], 'init', [1, 2, 3], 'update', [3]]);

		flushSync(() => delete_and_splice.click());
		assert.deepEqual(logs, ['update', [3]]);
	}
});
