import { flushSync } from 'svelte';
import { test } from '../../test';

// The effect in `Writer` empties `items` while effects are flushed. The each block re-runs right
// away, so that the effect inside the removed item doesn't run for the rest of the flush (it would
// read `items[0]`, which doesn't exist anymore), even though the item is only removed when the
// batch with the write commits
export default test({
	mode: ['client'],

	test({ assert, target, logs }) {
		assert.deepEqual([...logs], ['item effect: go=false name=a']);

		flushSync(() => target.querySelector('button')?.click());

		assert.deepEqual([...logs], ['item effect: go=false name=a']);
		assert.htmlEqual(target.innerHTML, '<button>go</button>');
	}
});
