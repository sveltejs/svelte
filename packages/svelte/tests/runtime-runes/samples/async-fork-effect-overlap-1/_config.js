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
		assert.deepEqual(logs, ['called with 0,1', 'called with 1,1']); // if 'called with 1,1' happens a few button clicks later that would also be ok
		assert.htmlEqual(p.innerHTML, '0');
		logs.length = 0;

		pop.click(); // the rerunning fork
		await tick();
		pop.click(); // the first real world run
		await tick();
		assert.deepEqual(logs, []);
		assert.htmlEqual(p.innerHTML, '1');
		logs.length = 0;

		commit.click();
		await tick();
		assert.deepEqual(logs, []);
		assert.htmlEqual(p.innerHTML, '2');

		pop.click();
		await tick();
	}
});
