import { flushSync } from 'svelte';
import { test } from '../../test';

// The parent effect writes `show = false` into the next batch, but the
// `{#if}` runs eagerly while the `count` batch is still committing.
// The child's teardown therefore sees both reverted values:
// `count = 0` and `show = true`.
export default test({
	html: '<button>increment</button><p>child</p>',

	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.htmlEqual(target.innerHTML, '<button>increment</button>');
		assert.deepEqual(logs, ['setup', 'teardown: count=0 show=true']);
	}
});
