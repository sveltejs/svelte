import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	skip_no_async: true,
	async test({ assert, target }) {
		const forkButton = target.querySelector('button');

		flushSync(() => {
			forkButton?.click();
		});

		const [, clickButton] = target.querySelectorAll('button');
		const p = target.querySelector('p');

		assert.equal(p?.textContent, '0');

		flushSync(() => {
			clickButton?.click();
		});

		assert.equal(p?.textContent, '1');
	}
});
