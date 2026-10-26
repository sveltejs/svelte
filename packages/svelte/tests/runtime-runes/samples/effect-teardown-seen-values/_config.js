import { flushSync } from 'svelte';
import { test } from '../../test';

// `x` and `z` are written in effects while the batch with the `go` write is committed, so they belong
// to the next batch and are reverted together
export default test({
	// this doesn't work as we'd like, because effects that get scheduled during commit typically
	// run immediately — in this case, that's the `after` effect, which runs before `z=1`
	skip: true,

	test({ assert, target, logs }) {
		assert.deepEqual(logs, ['before: x=0', 'after: x=0 z=0']);

		flushSync(() => target.querySelector('button')?.click());

		assert.deepEqual(logs, [
			'before: x=0',
			'after: x=0 z=0',
			'x=1',
			'z=1',
			'before cleanup: x=0',
			'before: x=1',
			'after cleanup: x=0 z=0',
			'after: x=1 z=1'
		]);
	}
});
