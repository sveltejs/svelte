import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, logs }) {
		const p = target.querySelector('p');
		const btn = target.querySelector('button');

		assert.deepEqual(logs, ['up']);
		assert.equal(p?.dataset.count, '0');

		flushSync(() => {
			btn?.click();
		});

		assert.deepEqual(logs, ['up']);
		assert.equal(p?.dataset.count, '1');
	}
});
