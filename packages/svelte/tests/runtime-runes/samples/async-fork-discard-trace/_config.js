import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	test({ assert, target, logs }) {
		const [discard, show] = target.querySelectorAll('button');

		flushSync(() => discard.click());
		flushSync(() => show.click());

		// the key reads as before the fork, without the trace logging an internal marker for it
		assert.ok(logs.length > 0);
		assert.ok(!logs.some((log) => typeof log === 'symbol'));
	}
});
