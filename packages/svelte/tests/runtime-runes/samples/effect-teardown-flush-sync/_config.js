import { flushSync } from 'svelte';
import { test } from '../../test';

// Effects that run in a flush inside a teardown see the teardown's writes
export default test({
	html: `<button>hide</button><p>0</p> child`,

	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.htmlEqual(target.innerHTML, `<button>hide</button><p>1</p>`);
		assert.deepEqual(logs, ['effect 0', 'effect 1', 'after flush 1']);
	}
});
