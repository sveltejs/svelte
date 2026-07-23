import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>x</button><button>show</button><button>shift</button>';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [x, show, shift] = target.querySelectorAll('button');

		assert.htmlEqual(target.innerHTML, `<p>true</p><p>1</p>${buttons}`);
		assert.deepEqual(logs, []);

		// write x — the batch is pending on its async expression, and claims
		// the `positive` derived (marked through x)
		x.click();
		await tick();
		assert.deepEqual(logs, []);

		// an independent batch runs the effect, which reads the claimed derived
		// through the pending batch's overlay (x = 1, so `positive` is true)
		show.click();
		await tick();
		assert.deepEqual(logs, ['positive true']);

		// the pending batch settles and commits x = 2 — `positive` recomputes
		// to the same value (true), so the effect should not re-run
		shift.click();
		await tick();
		assert.deepEqual(logs, ['positive true']);
		assert.htmlEqual(target.innerHTML, `<p>true</p><p>2</p>${buttons}`);
	}
});
