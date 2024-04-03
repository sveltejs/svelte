import { flushSync } from 'svelte';
import { test } from '../../test';
import { log } from './log.js';

export default test({
	// The component context class instance gets shared between tests, strangely, causing hydration to fail?
	mode: ['client', 'server'],

	before_test() {
		log.length = 0;
	},

	async test({ assert, target }) {
		const btn = target.querySelector('button');

		flushSync(() => {
			btn?.click();
		});

		assert.deepEqual(log, [0, 'class trigger false', 'local trigger false', 1]);

		flushSync(() => {
			btn?.click();
		});

		assert.deepEqual(log, [0, 'class trigger false', 'local trigger false', 1, 2]);

		flushSync(() => {
			btn?.click();
		});

		assert.deepEqual(log, [0, 'class trigger false', 'local trigger false', 1, 2, 3]);

		flushSync(() => {
			btn?.click();
		});

		assert.deepEqual(log, [
			0,
			'class trigger false',
			'local trigger false',
			1,
			2,
			3,
			4,
			'class trigger true',
			'local trigger true'
		]);
	}
});
