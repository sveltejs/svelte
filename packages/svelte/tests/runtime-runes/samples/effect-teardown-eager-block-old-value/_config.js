import { flushSync } from 'svelte';
import { test } from '../../test';

// The `{#if}` block runs eagerly because of a write in an effect while the batch with the `count`
// write is committed. The teardown it causes sees the values that the effect saw when it last ran,
// from before both writes — even though the effect didn't read them
export default test({
	html: '<button>increment</button><p>child</p>',

	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.htmlEqual(target.innerHTML, '<button>increment</button>');
		assert.deepEqual(logs, ['setup', 'teardown: count=1 show=true']);
	}
});
