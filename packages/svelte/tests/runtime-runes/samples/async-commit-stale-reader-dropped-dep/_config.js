import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [x, y, shift] = target.querySelectorAll('button');

		assert.deepEqual(logs, ['effect _ 0']);

		// write x — the batch is pending on its async expression
		x.click();
		await tick();
		assert.deepEqual(logs, ['effect _ 0']);

		// the effect reads `x` through the pending batch's overlay
		// (seeing the held-back value 0)
		y.click();
		await tick();
		assert.deepEqual(logs, ['effect _ 0', 'effect 0 1']);

		// the effect re-runs and no longer depends on `x` at all
		y.click();
		await tick();
		assert.deepEqual(logs, ['effect _ 0', 'effect 0 1', 'effect _ 2']);

		// the pending batch settles and commits x = 1 — the effect no longer
		// depends on `x`, so it should not re-run
		shift.click();
		await tick();
		assert.deepEqual(logs, ['effect _ 0', 'effect 0 1', 'effect _ 2']);
		assert.htmlEqual(
			target.innerHTML,
			'<p>1</p><button>x</button><button>y</button><button>shift</button>'
		);
	}
});
