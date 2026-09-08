import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [x, y, shift] = target.querySelectorAll('button');

		assert.htmlEqual(
			target.innerHTML,
			'<p>0</p><button>x</button><button>y</button><button>shift</button>'
		);
		assert.deepEqual(logs, []);

		// write x — the batch is pending on its async expression
		x.click();
		await tick();
		assert.deepEqual(logs, []);

		// an independent batch runs the effect, which newly depends on `x` —
		// it reads the latest value (1) rather than the held-back one (0)
		y.click();
		await tick();
		assert.deepEqual(logs, ['effect 1 1']);

		// the pending batch settles and commits x === 1 — exactly the value
		// the effect already saw, so it should not re-run
		shift.click();
		await tick();
		assert.deepEqual(logs, ['effect 1 1']);
		assert.htmlEqual(
			target.innerHTML,
			'<p>1</p><button>x</button><button>y</button><button>shift</button>'
		);
	}
});
