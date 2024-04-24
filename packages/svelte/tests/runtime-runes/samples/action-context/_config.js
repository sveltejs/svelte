import { ok, test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	html: `<button>0</button>`,

	async test({ assert, target, logs }) {
		const btn = target.querySelector('button');
		ok(btn);

		flushSync(() => btn.click());
		assert.deepEqual(logs, ['update', 0, 1]);

		flushSync(() => btn.click());
		assert.deepEqual(logs, ['update', 0, 1, 'destroy', 1]);
	}
});
