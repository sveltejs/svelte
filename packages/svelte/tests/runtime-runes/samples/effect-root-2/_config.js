import { flushSync } from 'svelte';
import { test } from '../../test';
import { log } from './log.js';

export default test({
	before_test() {
		log.length = 0;
	},

	async test({ assert, target }) {
		const [b1, b2] = target.querySelectorAll('button');

		flushSync(() => {
			b1.click();
		});

		assert.deepEqual(log, [0]);

		flushSync(() => {
			b2.click();
		});

		assert.deepEqual(log, [0, 'cleanup']);

		flushSync(() => {
			b1.click();
		});

		assert.deepEqual(log, [0, 'cleanup']);
	}
});
