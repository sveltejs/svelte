import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();

		const [a, b, pop] = target.querySelectorAll('button');

		a.click();
		await tick();
		assert.deepEqual(logs, ['a+b 1']);
		logs.length = 0;

		b.click();
		await tick();
		assert.deepEqual(logs, ['a+b 2', 'b 1']);
		logs.length = 0;

		pop.click();
		await tick();
		assert.deepEqual(logs, []);

		pop.click();
		await tick();
		// At this point the two batches are merged, and no async effects should be rerun
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
