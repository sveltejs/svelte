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

		// B re-runs `push(a + b)`, which A ran, so its view includes A's change (see `Batch#intersects`):
		// it ran `push(a + b)` with 2, which is still current once A committed
		resolve.click();
		await tick();
		assert.equal(target.querySelector('p'), null);
		assert.deepEqual(logs, [0, 1, 2]);
	}
});
