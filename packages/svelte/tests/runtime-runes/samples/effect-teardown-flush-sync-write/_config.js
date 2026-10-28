import { flushSync } from 'svelte';
import { test } from '../../test';

// A teardown doesn't revert writes made by effects in a flush inside it
export default test({
	html: `<button>hide</button><p>0 0</p> child`,

	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.htmlEqual(target.innerHTML, `<button>hide</button><p>2 1</p>`);
		assert.deepEqual(logs, ['before 0', 'after 2']);
	}
});
