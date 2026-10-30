import { tick } from 'svelte';
import { test } from '../../test';

// A batch whose view undoes the write that made a derived's global state outdated keeps seeing
// that state after another batch's view has replaced it, so its async work isn't restarted
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [a, b, resolve_y, resolve_all] = target.querySelectorAll('button');
		const buttons =
			'<button>a</button><button>b</button><button>resolve y</button><button>resolve all</button>';

		assert.htmlEqual(target.innerHTML, `${buttons}<p>0,0</p><p>0</p>`);
		logs.length = 0;

		// batch A
		a.click();
		await tick();
		assert.deepEqual(logs, ['x 1,0', 'y 1']);

		// batch B re-runs `x`, which A ran, so its view includes A's write (see `Batch#intersects`).
		// `d` is evaluated with the latest values there, so that run becomes its global state
		b.click();
		await tick();
		assert.deepEqual(logs, ['x 1,0', 'y 1', 'x 1,2']);

		// A is processed again. Its view undoes B's write, and `x` is still current there
		resolve_y.click();
		await tick();
		assert.deepEqual(logs, ['x 1,0', 'y 1', 'x 1,2']);

		// B is done, and merges into A: B's run of `x` supersedes A's
		resolve_all.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1,2</p><p>1</p>`);
		assert.deepEqual(logs, ['x 1,0', 'y 1', 'x 1,2']);
	}
});
