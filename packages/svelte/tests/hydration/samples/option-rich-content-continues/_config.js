import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	// This test verifies that hydration continues correctly after
	// an option element with rich HTML content
	snapshot(target) {
		const select = target.querySelector('select');
		const options = target.querySelectorAll('option');
		const p = target.querySelector('p');
		const button = target.querySelector('button');

		return {
			select,
			option1: options[0],
			option2: options[1],
			p,
			button
		};
	},

	async test(assert, target) {
		const option = target.querySelector('option');
		const button = target.querySelector('button');

		assert.equal(option?.textContent, 'hello hello');

		flushSync(() => {
			button?.click();
		});

		assert.equal(option?.textContent, 'changed changed');
	}
});
