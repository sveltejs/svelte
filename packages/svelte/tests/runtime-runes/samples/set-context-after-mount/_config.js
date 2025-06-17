import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ target, assert, logs }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());
		assert.ok(logs[0].startsWith('set_context_after_init'));
	}
});
