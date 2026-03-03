import { flushSync } from 'svelte';
import { test } from '../../test';
import { disable_async_mode_flag, enable_async_mode_flag } from '../../../../src/internal/flags';

let was_async = false;

export default test({
	mode: ['client'],
	compileOptions: {
		experimental: {
			async: false
		}
	},
	html: '<button>clear</button><div><p>hello</p></div>',

	before_test() {
		// The async_mode_flag is a global mutable flag that gets enabled by other tests.
		// We need to explicitly disable it for this test to exercise the non-async code path
		// where the bug manifests.
		was_async = true;
		disable_async_mode_flag();
	},

	after_test() {
		if (was_async) {
			enable_async_mode_flag();
		}
	},

	async test({ assert, target, raf, logs }) {
		const button = target.querySelector('button');

		// Setting value = undefined simultaneously:
		// 1. Makes the outer {#if value} condition false → outer BLOCK_EFFECT runs
		// 2. Marks the {@const} derived dirty (it depends on `value`)
		// 3. Marks the nested {#if result.ready} BLOCK_EFFECT as MAYBE_DIRTY
		//
		// During the flush traversal:
		// - The outer BLOCK_EFFECT runs first, calling pause_effect on the BRANCH_EFFECT
		// - The transition in Inner.svelte keeps the branch INERT but alive (not destroyed)
		// - The traversal continues into the INERT BRANCH_EFFECT's children
		// - The nested BLOCK_EFFECT is encountered; is_dirty() checks its deps
		// - The {@const} derived is dirty → update_derived() is called
		//
		// Without the patch: compute(undefined) is called — the derived re-evaluates
		// even though its parent effect is being torn down.
		// With the patch: update_derived() sees the parent is INERT and returns
		// the stale value.
		flushSync(() => {
			button.click();
		});

		// compute() should only be called once (with 'hello' during initial render).
		// If the bug is present, it gets called a second time with undefined.
		assert.ok(
			!logs.includes(undefined),
			'compute() should not be called with undefined while the block is inert'
		);

		// Let the transition finish and clean up
		raf.tick(100);
	}
});
