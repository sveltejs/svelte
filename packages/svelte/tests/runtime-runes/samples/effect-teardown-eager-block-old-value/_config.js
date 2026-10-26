import { flushSync } from 'svelte';
import { test } from '../../test';

// The `{#if}` block runs because `count++` causes the effect in the parent component
// to run, which sets `show = false` in a new batch. The teardown in the child sees
// the latest `count`, but the reverted `show` because that change caused the teardown
export default test({
	// This fails because the block effect runs eagerly during flush (see `eager_block_effects`
	// in `batch.js`), which nulls out `committing_batch` rather than setting it to `current_batch`,
	// which would cause a separate failure in `onmount-prop-access`
	skip: true,

	html: '<button>increment</button><p>child</p>',

	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.htmlEqual(target.innerHTML, '<button>increment</button>');
		assert.deepEqual(logs, ['setup', 'teardown: count=1 show=true']);
	}
});
