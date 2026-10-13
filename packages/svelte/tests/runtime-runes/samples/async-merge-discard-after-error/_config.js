import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, push, clear, shift] = target.querySelectorAll('button');

		shift.click();
		await tick();
		assert.deepEqual(logs, ['mount 1', 'mount 2', 'mount 3']);

		// batch X: a=1, pending
		a.click();
		await tick();

		// batch Y: list changes; the each block reads `a`, so Y merges into X.
		// The each block registers commit/discard callbacks with Y
		push.click();
		await tick();

		// X resolves and throws while processing (not handled by any boundary), so it is discarded
		// rather than committed. Y's discard callbacks must still run
		let error = null;
		shift.click();
		try {
			for (let i = 0; i < 10; i++) {
				await Promise.resolve();
				flushSync();
			}
		} catch (e) {
			error = e;
		}
		assert.match(/** @type {Error} */ (error)?.message, /^boom/);

		logs.length = 0;
		clear.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`<button>a</button><button>push</button><button>clear</button><button>shift</button><p>a: 0</p>`
		);
		// the removed items must be destroyed, not kept around for the discarded batch Y
		assert.deepEqual(logs, ['destroy 1', 'destroy 2', 'destroy 3']);
	}
});
