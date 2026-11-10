import { tick } from 'svelte';
import { test } from '../../test';

// `$state.eager` evaluates its expression in the real world. That must not touch the runs
// that the batch whose view is active holds, or the batch would redo the async work that read them
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [a, b, resolve_y, resolve_all] = target.querySelectorAll('button');
		const buttons =
			'<button>a</button><button>b</button><button>resolve y</button><button>resolve all</button><button>c</button>';

		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);
		logs.length = 0;

		// batch A
		a.click();
		await tick();
		assert.deepEqual(logs, ['x 10']);

		// batch B, whose view undoes A's write — so its run of `d` is a record in B.
		// (In the real world, `d` reads `c` now, i.e. its dependencies change)
		b.click();
		await tick();
		assert.deepEqual(logs, ['x 10', 'y 1', 'x 1']);

		// B is processed again, and creates the branch, which evaluates `d` in the real world.
		// `x` is still current in B's view
		resolve_y.click();
		await tick();
		assert.deepEqual(logs, ['x 10', 'y 1', 'x 1']);

		// B commits (without redoing `x`), and A sees `b = 1` now
		resolve_all.click();
		await tick();
		assert.deepEqual(logs, ['x 10', 'y 1', 'x 1', 'x 11']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><span>11</span>`);

		resolve_all.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>11</p><span>11</span>`);
	}
});
