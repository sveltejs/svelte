import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target, logs }) {
		const [b1] = target.querySelectorAll('button');
		flushSync(() => {
			b1.click();
		});
		flushSync(() => {
			b1.click();
		});
		assert.deepEqual(logs, [
			{ a: 1 },
			{ b: 1 },
			{ c: 1 },
			{ a: 2 },
			{ b: 2 },
			{ c: 2 },
			{ a: 3 },
			{ b: 3 },
			{ c: 3 }
		]);
	}
});
