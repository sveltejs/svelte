import { flushSync } from 'svelte';
import { test } from '../../test';

// The item branch that the first effect selects is never created: the eagerly re-run each
// block only works out which items it selects, and by the time the batch runs the block,
// the second effect has emptied the array again
export default test({
	mode: ['client'],

	test({ assert, target, logs }) {
		const [go, keep, set] = target.querySelectorAll('button');
		const buttons = '<button>go</button><button>keep</button><button>set</button>';

		flushSync(() => go.click());
		assert.deepEqual([...logs], []);
		assert.htmlEqual(target.innerHTML, buttons);

		// an item that stays selected is created when the batch runs the block
		flushSync(() => keep.click());
		assert.deepEqual([...logs], ['setup']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>child</p>`);

		// a regular update to the collection doesn't create another item
		flushSync(() => set.click());
		assert.deepEqual([...logs], ['setup']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>child</p>`);
	}
});
