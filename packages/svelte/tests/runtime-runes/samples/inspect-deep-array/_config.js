import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ target, assert, logs }) {
		const button = target.querySelector('button');

		flushSync(() => {
			button?.click();
		});

		assert.deepEqual(logs, [
			'init',
			[1, 2, 3, 7],
			'update',
			[2, 2, 3, 7],
			'update',
			[2, 3, 3, 7],
			'update',
			[2, 3, 7, 7],
			'update',
			[2, 3, 7]
		]);
	}
});
