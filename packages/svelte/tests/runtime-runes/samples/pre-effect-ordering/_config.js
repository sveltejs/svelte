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
			b1.click();
		});
		flushSync(() => {
			b1.click();
		});

		assert.deepEqual(log, [
			'Outer Effect Start (0)',
			'Outer Effect End (0)',
			'Inner Effect (0)',
			'Outer Effect Start (1)',
			'Outer Effect End (1)',
			'Inner Effect (1)',
			'Outer Effect Start (2)',
			'Outer Effect End (2)',
			'Inner Effect (2)'
		]);
	}
});
