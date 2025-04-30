import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	test({ assert, target, logs }) {
		const buttons = target.querySelectorAll('button');

		buttons.forEach((b) => b.click());
		flushSync();
		buttons.forEach((b) => b.click());
		flushSync();
		buttons.forEach((b) => b.click());
		flushSync();
		assert.deepEqual(logs, [2, 5, 6, 7, 9, 11]);
		assert.htmlEqual(
			target.innerHTML,
			'<button data-step="2">clicks: 11</button><button data-step="3">inc</button><button>next</button>'
		);
	}
});
