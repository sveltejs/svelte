import { flushSync } from 'svelte';
import { test } from '../../test';

// The first effect's teardown evaluates `double` before its setup writes `x`. The child
// it creates is detached when that batch commits, so the child's teardown sees the
// batch's writes reverted (`x = 0`) and must recompute `double` as 0, rather than reusing
// the 2 cached by the child's setup.
export default test({
	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.htmlEqual(target.innerHTML, '<button>go</button>');
		assert.deepEqual(
			[...logs],
			['writer teardown: double=0', 'child setup: x=1 double=2', 'child teardown: x=0 double=0']
		);
	}
});
