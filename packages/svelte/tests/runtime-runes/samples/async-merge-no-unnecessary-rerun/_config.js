import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();

		const [a, b, pop] = target.querySelectorAll('button');

		// batch A: a=1
		a.click();
		await tick();
		assert.deepEqual(logs, ['a+b 1']);
		logs.length = 0;

		// batch B: b=1. B doesn't write `a`, but it re-runs the `a+b` expression, which A ran, so it
		// intersects with A (see `Batch#intersects`): in B's view `a` is 1, too
		b.click();
		await tick();
		assert.deepEqual(logs, ['a+b 2', 'b 1']);
		logs.length = 0;

		// resolves B's `b` run
		pop.click();
		await tick();
		assert.deepEqual(logs, []);

		// resolves B's `a+b` run -> B merges into A, and its run supersedes A's. Nothing re-runs
		pop.click();
		await tick();
		assert.deepEqual(logs, []);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>a</button>
			<button>b</button>
			<button>pop</button>
			1 + 1 = 2 | 1
		`
		);

		// resolving A's obsolete `a+b` run changes nothing
		pop.click();
		await tick();
		assert.deepEqual(logs, []);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>a</button>
			<button>b</button>
			<button>pop</button>
			1 + 1 = 2 | 1
		`
		);
	}
});
