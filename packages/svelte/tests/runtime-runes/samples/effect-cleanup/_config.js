import { async_mode } from '../../../helpers';
import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target, logs }) {
		const [b1] = target.querySelectorAll('button');
		flushSync(() => {
			b1.click();
		});
		flushSync(() => {
			b1.click();
		});

		// With async mode (which is on by default for runtime-runes) this works as expected, without it
		// it works differently: https://github.com/sveltejs/svelte/pull/15564
		assert.deepEqual(
			logs,
			async_mode ? ['init 0', 'cleanup 0', null, 'init 2', 'cleanup 2', null, 'init 4'] : ['init 0']
		);
	}
});
