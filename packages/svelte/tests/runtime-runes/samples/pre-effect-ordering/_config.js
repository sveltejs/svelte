import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [b1] = target.querySelectorAll('button');

		flushSync(() => {
			b1.click();
		});
		flushSync(() => {
			b1.click();
		});

		assert.deepEqual(logs, [
			'Outer Effect Start (0)',
			'Inner Effect (0)',
			'Outer Effect End (0)',
			'Outer Effect Start (1)',
			'Inner Effect (1)',
			'Outer Effect End (1)',
			'Outer Effect Start (2)',
			'Inner Effect (2)',
			'Outer Effect End (2)'
		]);
	}
});
