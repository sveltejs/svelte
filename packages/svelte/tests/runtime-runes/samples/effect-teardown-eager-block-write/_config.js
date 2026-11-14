import { flushSync } from 'svelte';
import { test } from '../../test';

// The branch is detached when the batch that writes `show = false` commits. By then the
// sibling effect (from the previous batch) has already torn down, seeing `value = 0`.
// The write made by the child's teardown must nevertheless win over that batch's
// reverted values, as `<p>1:55</p>` shows.
export default test({
	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.htmlEqual(target.innerHTML, '<button>go</button><p>1:55</p>');
		assert.deepEqual([...logs], ['sibling teardown: value=0', 'child teardown: value=55']);
	}
});
