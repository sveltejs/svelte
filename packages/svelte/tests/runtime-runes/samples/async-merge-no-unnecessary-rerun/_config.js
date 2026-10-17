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

		// batch B: b=1. B doesn't write `a`, so it stays independent of A: in B's view `a` is
		// still 0, so both expressions run with a=0, b=1
		// TODO can we at some point detect the overlap through the async effect?
		b.click();
		await tick();
		assert.deepEqual(logs, ['a+b 1', 'b 1']);
		logs.length = 0;

		// resolves B's `b` run
		pop.click();
		await tick();
		assert.deepEqual(logs, []);

		// resolves B's `a+b` run -> B commits on its own (without A's a=1). In A's view, `b` is
		// now 1, so A's `a+b` run (which read b=0) is outdated and re-runs. A never ran the `b`
		// expression and its value (B's result) is still current in A's view, so it isn't re-run
		pop.click();
		await tick();
		assert.deepEqual(logs, ['a+b 2']);
		logs.length = 0;
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>a</button>
			<button>b</button>
			<button>pop</button>
			0 + 1 = 1 | 1
		`
		);

		// resolves A's `a+b` re-run -> A commits, and no async effects should be rerun
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

		// resolving A's obsolete first `a+b` run changes nothing
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
