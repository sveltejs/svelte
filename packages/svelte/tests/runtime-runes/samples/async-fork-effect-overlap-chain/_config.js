import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [fork, update, pop, commit] = target.querySelectorAll('button');
		const [sum, doubled] = target.querySelectorAll('p');
		logs.length = 0;

		fork.click();
		await tick();
		assert.deepEqual(logs, ['sum 1,0']);
		logs.length = 0;

		// Revalidate twice to also check that retaining async results does not
		// prevent the fork from responding to genuine changes to its inputs.
		for (const y of [1, 2]) {
			update.click();
			await tick();
			assert.deepEqual(logs, [`sum 0,${y}`, `sum 1,${y}`]);
			logs.length = 0;

			pop.click(); // resolve the fork before the real world
			await tick();
			assert.deepEqual(logs, [`double ${y + 1}`]);
			logs.length = 0;

			pop.click();
			await tick();
			assert.deepEqual(logs, [`double ${y}`]);
			assert.htmlEqual(sum.innerHTML, String(y));
			assert.htmlEqual(doubled.innerHTML, String(y * 2));
			logs.length = 0;
		}

		commit.click();
		await tick();
		assert.deepEqual(logs, []);
		assert.htmlEqual(sum.innerHTML, '3');
		assert.htmlEqual(doubled.innerHTML, '6');

		pop.click(); // the superseded first fork run
		await tick();
		assert.htmlEqual(sum.innerHTML, '3');
		assert.htmlEqual(doubled.innerHTML, '6');
	}
});
