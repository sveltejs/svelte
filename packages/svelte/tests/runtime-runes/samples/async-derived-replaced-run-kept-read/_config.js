import { tick } from 'svelte';
import { test } from '../../test';

// Like `async-derived-replaced-run-kept`, but the derived is evaluated in the real world
// (outside of processing), which replaces its global state, too
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

		// batch B, which reads `d` in the real world right away
		b.click();
		await tick();
		assert.deepEqual(logs, ['x 1,0', 'y 1', 'd = 2', 'x 0,2']);

		// A is processed again, `x` is still current in its view
		resolve_y.click();
		await tick();
		assert.deepEqual(logs, ['x 1,0', 'y 1', 'd = 2', 'x 0,2']);

		resolve_all.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0,2</p><p>0</p>`);
		assert.deepEqual(logs, ['x 1,0', 'y 1', 'd = 2', 'x 0,2', 'x 1,2']);

		resolve_all.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1,2</p><p>1</p>`);
	}
});
