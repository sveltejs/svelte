import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	async test({ assert, target, logs }) {
		const [both, increment] = target.querySelectorAll('button');

		flushSync();
		assert.deepEqual(logs, [0]);

		// re-run the block and invalidate the effect inside the root in the same flush
		flushSync(() => both.click());
		assert.htmlEqual(target.innerHTML, `<button>both</button><button>increment</button><p>2</p>`);
		assert.deepEqual(logs, [0, 1]);

		flushSync(() => increment.click());
		assert.htmlEqual(target.innerHTML, `<button>both</button><button>increment</button><p>4</p>`);
		assert.deepEqual(logs, [0, 1, 2]);
	}
});
