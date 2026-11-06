import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [x, y, shift, pop, commit] = target.querySelectorAll('button');
		const [p] = target.querySelectorAll('p');
		logs.length = 0;

		x.click();
		await tick();
		assert.deepEqual(logs, ['called with 1,0']);
		logs.length = 0;

		y.click();
		await tick();
		// the fork doesn't see the pending y = 1 yet (it re-runs with it once that batch commits)
		assert.deepEqual(logs, ['called with 0,1']);
		assert.htmlEqual(p.innerHTML, '0');
		logs.length = 0;

		pop.click(); // the real world run, which commits and makes the fork re-run with y = 1
		await tick();
		assert.deepEqual(logs, ['called with 1,1']);
		assert.htmlEqual(p.innerHTML, '1');
		logs.length = 0;

		pop.click(); // the rerunning fork
		await tick();
		assert.deepEqual(logs, []);
		assert.htmlEqual(p.innerHTML, '1');
		logs.length = 0;

		commit.click();
		await tick();
		assert.deepEqual(logs, []);
		assert.htmlEqual(p.innerHTML, '2');

		pop.click(); // the fork's first (obsolete) run
		await tick();
		assert.deepEqual(logs, []);
		assert.htmlEqual(p.innerHTML, '2');
	}
});
