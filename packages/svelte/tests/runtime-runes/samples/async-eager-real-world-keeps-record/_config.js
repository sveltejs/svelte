import { tick } from 'svelte';
import { test } from '../../test';

// `$state.eager` evaluates its expression in the real world. That must not touch the runs
// that the batch whose view is active holds, or the batch would redo the async work that read them
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [a, b, other, resolve_y, resolve_x, resolve_all] = target.querySelectorAll('button');
		const buttons =
			'<button>a</button><button>b</button><button>other</button><button>resolve y</button><button>resolve x</button><button>resolve all</button>';

		assert.htmlEqual(target.innerHTML, `${buttons}<b>0</b><p>0</p><p>0</p>`);
		logs.length = 0;

		// batch A, which is pending
		a.click();
		await tick();
		assert.deepEqual(logs, ['z 1']);

		// batch B, whose view undoes A's write — so its run of `d` (`1`) is a record in B
		b.click();
		await tick();
		assert.deepEqual(logs, ['z 1', 'y 1', 'x 1']);

		// B is processed again, and creates the branch, whose `$state.eager(d)` evaluates `d`
		// in the real world (`11`) while B's view is active
		resolve_y.click();
		await tick();
		assert.deepEqual(logs, ['z 1', 'y 1', 'x 1']);
		assert.htmlEqual(target.innerHTML, `${buttons}<b>0</b><p>0</p><p>0</p>`);

		// an unrelated batch commits, so B is processed again and re-validates what reads its writes.
		// Its record of `d` still holds, so `f('x', d)` doesn't run again
		other.click();
		await tick();
		assert.deepEqual(logs, ['z 1', 'y 1', 'x 1']);
		assert.htmlEqual(target.innerHTML, `${buttons}<b>1</b><p>0</p><p>0</p>`);

		// B commits, and A sees `b = 1` now
		resolve_x.click();
		await tick();
		assert.deepEqual(logs, ['z 1', 'y 1', 'x 1', 'x 11']);
		assert.htmlEqual(target.innerHTML, `${buttons}<b>1</b><p>0</p><p>1</p><span>11</span>`);

		// A commits
		resolve_all.click();
		await tick();
		assert.deepEqual(logs, ['z 1', 'y 1', 'x 1', 'x 11']);
		assert.htmlEqual(target.innerHTML, `${buttons}<b>1</b><p>1</p><p>11</p><span>11</span>`);
	}
});
