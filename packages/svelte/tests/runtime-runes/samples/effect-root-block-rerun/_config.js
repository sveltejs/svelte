import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	async test({ assert, target, logs }) {
		const [rerun, increment] = target.querySelectorAll('button');

		flushSync();
		assert.deepEqual(logs, [0]);

		flushSync(() => rerun.click());
		flushSync(() => increment.click());

		assert.htmlEqual(target.innerHTML, `<button>rerun</button><button>increment</button><p>2</p>`);
		assert.deepEqual(logs, [0, 1]);
	}
});
