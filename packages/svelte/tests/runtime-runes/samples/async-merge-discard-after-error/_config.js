import { flushSync, tick } from 'svelte';
import { test } from '../../test';

// TODO do we need this test?
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

		// batch Y: list changes. The each block reads `a`, but Y doesn't write `a`, so it stays
		// independent of X: in Y's view `a` is still 0, Y has no async work and commits right away,
		// mounting item 4
		push.click();
		await tick();
		assert.deepEqual(logs, ['mount 1', 'mount 2', 'mount 3', 'mount 4']);
		assert.htmlEqual(
			target.innerHTML,
			`<button>a</button><button>push</button><button>clear</button><button>shift</button><p>a: 0</p><span>1</span><span>2</span><span>3</span><span>4</span>`
		);

		// X resolves and throws while processing (not handled by any boundary), so it is discarded
		// rather than committed. This must not leave anything behind
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
		// the removed items (including item 4, committed by Y) must be destroyed, not kept around
		// for the discarded batch X
		assert.deepEqual(logs, ['destroy 1', 'destroy 2', 'destroy 3', 'destroy 4']);
	}
});
