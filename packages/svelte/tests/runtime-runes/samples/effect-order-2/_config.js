import { test } from '../../test';
import { flushSync } from 'svelte';
import { log } from './log.js';

export default test({
	before_test() {
		log.length = 0;
	},

	async test({ assert, target }) {
		const [b1] = target.querySelectorAll('button');
		flushSync(() => {
			b1.click();
		});
		flushSync(() => {
			b1.click();
		});
		assert.deepEqual(log, [
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
