import { flushSync } from 'svelte';
import { test } from '../../test';

// The eager run deselects the branch, but it is only detached when the next batch
// — the one with `show = false` — commits. Its teardown therefore sees `count = 1`,
// which that batch does not revert, and `show = true`, which it does.
export default test({
	html: '<button>increment</button><p>child</p>',

	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.htmlEqual(target.innerHTML, '<button>increment</button>');
		assert.deepEqual(logs, ['setup', 'teardown: count=1 show=true']);
	}
});
