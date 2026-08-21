import { flushSync } from 'svelte';
import { test } from '../../test';
import { normalise_inspect_logs } from '../../../helpers.js';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, logs }) {
		const button = target.querySelector('button');

		flushSync(() => {
			button?.click();
		});

		assert.deepEqual(normalise_inspect_logs(logs), [
			'0',
			true,
			'1',
			false,
			'2',
			false,
			'0',
			false,
			'at $effect',
			'1',
			true,
			'at $effect'
		]);
	}
});
