import { flushSync } from 'svelte';
import { test, ok } from '../../test';

export default test({
	async test({ assert, logs, target }) {
		const button = target.querySelector('button');
		ok(button);

		flushSync(() => button.click());

		// All four teardowns should see the pre-change derived value (2), not the post-change value (10)
		assert.deepEqual(logs, ['effect.pre', 2, 'attach', 2, 'effect', 2, 'onDestroy', 2]);
	}
});
