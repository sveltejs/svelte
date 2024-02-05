import { flushSync } from 'svelte';
import { test } from '../../test';
import { log } from './log.js';

export default test({
	before_test() {
		log.length = 0;
	},

	async test({ assert, target }) {
		const [b1] = target.querySelectorAll('button');

		flushSync(() => {
			b1?.click();
		});

		await Promise.resolve();
		assert.deepEqual(log, ['clicked button']);
	}
});
