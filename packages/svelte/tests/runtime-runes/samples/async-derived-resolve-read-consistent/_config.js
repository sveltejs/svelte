import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [update, resolve] = target.querySelectorAll('button');

		update.click();
		await tick();

		resolve.click();
		await tick();

		// Once the async value has resolved, a derived of it must never be read with a stale value,
		// however a read is timed relative to the batch being processed
		assert.equal(logs.length, 10);
		for (const [value, doubled] of /** @type {[number, number][]} */ (logs)) {
			assert.equal(doubled, value * 2);
		}
		assert.deepEqual(logs.at(-1), [1, 2]);

		assert.htmlEqual(
			target.innerHTML,
			'<button>update</button><button>resolve and read</button><p>1:2</p>'
		);
	}
});
