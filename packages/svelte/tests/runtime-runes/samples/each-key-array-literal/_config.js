import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	async test({ assert, target }) {
		const button = target.querySelector('button');

		if (!button) {
			throw new Error('Expected button to exist');
		}

		flushSync(() => button.click());

		const items = [...target.querySelectorAll('li')].map((li) => li.textContent);
		assert.deepEqual(items, ['banana', 'carrot', 'doughnut', 'egg']);
	}
});
