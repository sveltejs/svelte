import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, logs }) {
		const button = target.querySelector('button');

		flushSync(() => {
			button?.click();
		});

		assert.deepEqual(logs, [
			'init',
			'0',
			true,
			'init',
			'1',
			false,
			'init',
			'2',
			false,
			'update',
			'0',
			false,
			'update',
			'1',
			true
		]);
	}
});
