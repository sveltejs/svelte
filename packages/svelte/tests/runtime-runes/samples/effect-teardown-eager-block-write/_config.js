import { flushSync } from 'svelte';
import { test } from '../../test';

// A write from the eagerly destroyed child's teardown must remain visible to
// subsequent sibling teardowns, including when an earlier effect also wrote state.
export default test({
	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.htmlEqual(target.innerHTML, '<button>go</button><p>1:55</p>');
		assert.deepEqual([...logs], ['child teardown: value=55', 'sibling teardown: value=55']);
	}
});
