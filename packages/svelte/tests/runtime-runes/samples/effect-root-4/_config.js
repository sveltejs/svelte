import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button>cleanup</button>',

	async test({ assert, target, logs }) {
		const btn = target.querySelector('button');

		btn?.click();
		flushSync();

		assert.deepEqual(logs, ['effect1', 'effect2']);
	},
	test_ssr({ assert, logs }) {
		assert.deepEqual(logs, []);
	}
});
