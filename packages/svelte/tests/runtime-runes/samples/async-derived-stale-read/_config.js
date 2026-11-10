import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();

		const [a, b, log, resolve] = target.querySelectorAll('button');

		a.click();
		await tick();
		b.click();
		await tick();
		resolve.click();
		await tick();
		assert.htmlEqual(target.querySelector('p')?.innerHTML ?? '', 'd is 1');

		// batches are independent: B started out with `a + b === 1` in its view (A's change undone).
		// A's commit changed B's view, so B re-ran `push(a + b)` with 2. The promise resolved here is
		// B's obsolete one, so nothing changes yet
		resolve.click();
		await tick();
		assert.htmlEqual(target.querySelector('p')?.innerHTML ?? '', 'd is 1');

		resolve.click();
		await tick();
		assert.equal(target.querySelector('p'), null);
		assert.deepEqual(logs, [0, 1, 2]);
	}
});
