import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const btn = target.querySelector('button');

		assert.throws(() => {
			flushSync(() => btn?.click());
		}, /kaboom/);
	}
});
