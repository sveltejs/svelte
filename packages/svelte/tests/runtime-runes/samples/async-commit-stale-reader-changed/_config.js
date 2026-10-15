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
		// it reads the held-back value (0) (at some point it read latest, but we decided against doing this)
		y.click();
		await tick();
		assert.deepEqual(logs, ['effect 0 1']);

		// the pending batch settles and commits x === 1, so the effect should re-run
		shift.click();
		await tick();
		assert.deepEqual(logs, ['effect 0 1', 'effect 1 1']);
		assert.htmlEqual(
			target.innerHTML,
			'<p>1</p><button>x</button><button>y</button><button>shift</button>'
		);
	}
});
