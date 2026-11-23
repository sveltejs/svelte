import { flushSync, tick } from 'svelte';
import { test } from '../../test';

// Combines `async-merge-no-unnecessary-rerun` and `async-merge-discard-after-error`, with batches that
// intersect (they all write `updates`), so that they are actually merged: a later batch that finishes
// first is merged into the earlier one
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [a, b, push, clear, shift, pop] = target.querySelectorAll('button');
		const buttons =
			'<button>a</button><button>b</button><button>push</button><button>clear</button><button>shift</button><button>pop</button>';
		const items = (/** @type {number[]} */ list) =>
			list.map((item) => `<span>${item}</span>`).join('');

		assert.deepEqual(logs, ['mount 1', 'mount 2', 'mount 3']);
		logs.length = 0;

		// batch X: a=1
		a.click();
		await tick();
		assert.deepEqual(logs, ['a+b 1']);
		logs.length = 0;

		// batch Y: b=1. It intersects X, so X's changes are part of its view
		b.click();
		await tick();
		assert.deepEqual(logs, ['a+b 2', 'b 1']);
		logs.length = 0;

		// batch Z: adds item 4. It intersects Y and has no async work, so it's merged into Y right away
		push.click();
		await tick();
		assert.deepEqual(logs, []);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0: 0 + 0 = 0 | 0</p>${items([1, 2, 3])}`);

		// resolves Y's `b` run
		pop.click();
		await tick();
		assert.deepEqual(logs, []);

		// resolves Y's `a+b` run -> Y is merged into X. Y's results are still valid in X's view, so
		// nothing runs again, and X commits (its own `a+b` run is obsolete)
		pop.click();
		await tick();
		assert.deepEqual(logs, ['mount 4']);
		logs.length = 0;
		assert.htmlEqual(target.innerHTML, `${buttons}<p>3: 1 + 1 = 2 | 1</p>${items([1, 2, 3, 4])}`);

		// resolves X's obsolete `a+b` run, which changes nothing
		pop.click();
		await tick();
		assert.deepEqual(logs, []);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>3: 1 + 1 = 2 | 1</p>${items([1, 2, 3, 4])}`);

		// batch X: a=2
		a.click();
		await tick();
		assert.deepEqual(logs, ['a+b 3']);
		logs.length = 0;

		// batch Y: adds item 5. It intersects X and has no async work, so it's merged into X right away
		push.click();
		await tick();
		assert.deepEqual(logs, []);

		// X resolves and throws while processing (not handled by any boundary), so it is discarded
		// rather than committed — and with it, what Y did
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
		assert.deepEqual(logs, []);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>3: 1 + 1 = 2 | 1</p>${items([1, 2, 3, 4])}`);

		// the removed items must be destroyed, not kept around for the discarded batch Y
		clear.click();
		await tick();
		assert.deepEqual(logs, ['destroy 1', 'destroy 2', 'destroy 3', 'destroy 4']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>3: 1 + 1 = 2 | 1</p>`);
	}
});
