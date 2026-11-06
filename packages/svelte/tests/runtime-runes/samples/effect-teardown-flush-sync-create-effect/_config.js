import { flushSync } from 'svelte';
import { test } from '../../test';

// Effects can be created in a flush inside a teardown, since they aren't part of it
export default test({
	html: `<button>hide</button> child`,

	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.htmlEqual(target.innerHTML, `<button>hide</button> inner`);
		assert.deepEqual(logs, ['inner effect', 'after flush']);
	}
});
