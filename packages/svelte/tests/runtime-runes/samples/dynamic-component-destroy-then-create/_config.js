import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	mode: ['client', 'hydrate'],

	async test({ assert, target, logs }) {
		const [button] = target.querySelectorAll('button');

		flushSync(() => button.click());
		assert.deepEqual(logs, ['create A', 'destroy A', 'create B']);
	}
});
