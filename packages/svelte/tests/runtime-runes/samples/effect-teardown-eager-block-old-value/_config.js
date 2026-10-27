import { flushSync } from 'svelte';
import { test } from '../../test';

// The `{#if}` block runs because `count++` causes the effect in the parent component
// to run, which sets `show = false` in a new batch. The teardown in the child sees
// the latest `count`, but the reverted `show` because that change caused the teardown
export default test({
	html: '<button>increment</button><p>child</p>',

	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.htmlEqual(target.innerHTML, '<button>increment</button>');
		assert.deepEqual(logs, ['setup', 'teardown: count=0 show=true']);
	}
});
