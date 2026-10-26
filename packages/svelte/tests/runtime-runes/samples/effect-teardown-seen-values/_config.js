import { flushSync } from 'svelte';
import { test } from '../../test';

// `x` and `z` are written in effects while the batch with the `go` write is committed, so they belong
// to the next batch. The `after` effect re-runs once while the first batch is committed (it saw the old
// `x`), and once in the next batch (it saw the new `x`, but the old `z`). The `before` effect re-runs in
// the next batch (it saw the old `x`). Each teardown sees the values its effect saw when it last ran
export default test({
	test({ assert, target, logs }) {
		assert.deepEqual(logs, ['before: x=0', 'after: x=0 z=0']);

		flushSync(() => target.querySelector('button')?.click());

		assert.deepEqual(logs, [
			'before: x=0',
			'after: x=0 z=0',
			'after cleanup: x=0 z=0',
			'after: x=1 z=0',
			'before cleanup: x=0',
			'before: x=1',
			'after cleanup: x=1 z=0',
			'after: x=1 z=1'
		]);
	}
});
