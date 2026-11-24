import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());

		assert.deepEqual(logs, [
			'register: one',
			'unregister: one',
			'leftover: none',
			'register: three'
		]);
	}
});
