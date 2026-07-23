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
		assert.deepEqual(logs, ['called with 0,1']);
		assert.htmlEqual(p.innerHTML, '0');
		logs.length = 0;

		pop.click();
		await tick();
		assert.deepEqual(logs, ['called with 1,1']);
		assert.htmlEqual(p.innerHTML, '1');
		logs.length = 0;

		commit.click();
		await tick();
		pop.click();
		await tick();
		assert.deepEqual(logs, []);
		assert.htmlEqual(p.innerHTML, '2');
	}
});
