import { flushSync } from 'svelte';
import { test } from '../../suite';

export default test({
	html: '<label>count: 0</label>',
	test({ assert, instance, calls }) {
		calls.length = 0;

		instance.increment();
		flushSync();

		// the text node is updated, not replaced
		assert.deepEqual(calls, ['text "count: 0" -> "count: 1"']);
	}
});
