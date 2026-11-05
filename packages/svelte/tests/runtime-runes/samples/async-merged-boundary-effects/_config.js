import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],
	async test({ assert, target, logs }) {
		await tick();
		const [refresh, open, resolve_first, resolve_last, reset] = target.querySelectorAll('button');

		for (const boundary_first of [true, false]) {
			assert.deepEqual(logs, ['effect ran in a, count = 0']);
			refresh.click();
			await tick();
			open.click();
			await tick();

			// The new boundary's async work outlives its original batch. Cover
			// resolution on both sides of the old view's outstanding refresh.
			if (boundary_first) {
				resolve_last.click();
				await tick();
				assert.deepEqual(logs, ['effect ran in a, count = 0', 'effect ran in b, count = 0']);
				resolve_first.click();
			} else {
				resolve_first.click();
				await tick();
				resolve_last.click();
			}
			await tick();

			const counter = target.querySelectorAll('button')[5];
			assert.equal(counter.textContent, 'b: clicked 0');
			assert.equal(target.querySelectorAll('p')[1].textContent, 'b data v1');
			assert.deepEqual(logs, ['effect ran in a, count = 0', 'effect ran in b, count = 0']);
			for (let count = 1; count <= 2; count++) {
				counter.click();
				await tick();
				assert.equal(counter.textContent, `b: clicked ${count}`);
				assert.equal(logs.at(-1), `effect ran in b, count = ${count}`);
				assert.equal(logs.length, count + 2);
			}

			logs.length = 0;
			reset.click();
			await tick();
		}
	}
});
