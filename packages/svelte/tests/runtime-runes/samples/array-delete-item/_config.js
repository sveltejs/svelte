import { ok, test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	mode: ['client'],
	async test({ target, assert, logs }) {
		const btn = target.querySelector('button');

		flushSync(() => btn?.click());

		assert.deepEqual(logs[0], [0, , 2]);
	}
});
