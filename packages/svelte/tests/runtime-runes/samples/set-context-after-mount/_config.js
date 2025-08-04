import { flushSync } from 'svelte';
import { test } from '../../test';
import { async_mode } from '../../../helpers';

export default test({
	async test({ target, assert, logs }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());
		assert.ok(
			async_mode
				? logs[0].startsWith('set_context_after_init')
				: logs[0] === 'works without experimental async but really shouldnt'
		);
	}
});
