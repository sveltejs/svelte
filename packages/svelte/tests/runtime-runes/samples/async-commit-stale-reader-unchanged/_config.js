import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [revert, y, shift] = target.querySelectorAll('button');

		assert.htmlEqual(
			target.innerHTML,
			'<p>0</p><button>revert</button><button>y</button><button>shift</button>'
		);
		assert.deepEqual(logs, []);

		// write x and revert it within the same batch — the batch is pending
		// (its async expression re-runs), with previous === current for `x`
		revert.click();
		await tick();
		assert.deepEqual(logs, []);

		// an independent batch runs the effect, which now reads `x` through
		// the pending batch's overlay (seeing the held-back value 0)
		y.click();
		await tick();
		assert.deepEqual(logs, ['effect 0 1']);

		// the pending batch settles and commits x === 0, i.e. exactly the value
		// the effect already saw — it should not re-run
		shift.click();
		await tick();
		assert.deepEqual(logs, ['effect 0 1']);
	}
});
