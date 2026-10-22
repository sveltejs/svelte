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

		// the key reads as before the fork, and the trace doesn't log an internal marker for it
		assert.htmlEqual(target.querySelector('p')?.innerHTML ?? '', '1');
		assert.ok(logs.length > 0);
		assert.ok(!logs.some((log) => typeof log === 'symbol'));
	}
});
