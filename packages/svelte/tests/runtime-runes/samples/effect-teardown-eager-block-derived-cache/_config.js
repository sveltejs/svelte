import { flushSync } from 'svelte';
import { test } from '../../test';

// The first effect's teardown evaluates `double` before its setup writes `x`.
// The child created by that setup must see the new value in both setup and teardown,
// even though another teardown in the same flush already evaluated the derived.
export default test({
	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.htmlEqual(target.innerHTML, '<button>go</button>');
		assert.deepEqual(
			[...logs],
			['writer teardown: double=0', 'child setup: x=1 double=2', 'child teardown: x=1 double=2']
		);
	}
});
