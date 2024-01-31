import { flushSync } from 'svelte';
import { test } from '../../test';
import { log } from './log.js';

export default test({
	before_test() {
		log.length = 0;
	},

	async test({ assert, target }) {
		const [b1, b2, b3] = target.querySelectorAll('button');

		flushSync(() => {
			b1.click();
			b2.click();
		});

		assert.deepEqual(log, [0, 1]);

		flushSync(() => {
			b3.click();
		});

		assert.deepEqual(log, [0, 1, 'cleanup 1', 'cleanup 2']);

		flushSync(() => {
			b1.click();
			b2.click();
		});

		assert.deepEqual(log, [0, 1, 'cleanup 1', 'cleanup 2']);
	}
});
