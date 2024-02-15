import { test } from '../../test';
import { flushSync } from 'svelte';
import { log } from './log.js';

export default test({
	before_test() {
		log.length = 0;
	},

	async test({ assert, target }) {
		const [b1, b2, b3] = target.querySelectorAll('button');
		log.length = 0;
		flushSync(() => {
			b1.click();
		});
		assert.deepEqual(log, ['a', 1]);
		log.length = 0;
		flushSync(() => {
			b2.click();
		});
		assert.deepEqual(log, ['b', 1]);
		log.length = 0;
		flushSync(() => {
			b3.click();
		});
		assert.deepEqual(log, ['c', 1]);
	}
});
