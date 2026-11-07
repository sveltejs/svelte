import { flushSync } from 'svelte';
import { test } from '../../test';

// The child is never rendered, because `show` is set `false` before it can be
export default test({
	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.htmlEqual(target.innerHTML, '<button>go</button>');
		assert.deepEqual(
			[...logs],
			['writer teardown: double=0']
		);
	}
});
