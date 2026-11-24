import { tick } from 'svelte';
import { test } from '../../test';

// Same as `async-commit-stale-reader-changed`, but the effect reads `x` through a derived
// that the pending batch never evaluated, so only the derived's dependency was written by it
export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [x, y, shift] = target.querySelectorAll('button');

		// write x — the batch is pending on its async expression
		x.click();
		await tick();
		assert.deepEqual(logs, []);

		// an independent batch runs the effect, which newly depends on `doubled` —
		// it is computed from the held-back value of `x` (0)
		y.click();
		await tick();
		assert.deepEqual(logs, ['effect 0 1']);

		// the pending batch settles and commits x === 1, so the effect should re-run
		shift.click();
		await tick();
		assert.deepEqual(logs, ['effect 0 1', 'effect 2 1']);
		assert.htmlEqual(
			target.innerHTML,
			'<p>1</p><button>x</button><button>y</button><button>shift</button>'
		);
	}
});
