import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	skip_no_async: true,
	async test({ assert, target }) {
		const [forkBtn, counterBtn] = target.querySelectorAll('button');

		flushSync(() => {
			forkBtn.click();
		});

		assert.equal(counterBtn.textContent, '0');

		flushSync(() => {
			counterBtn.click();
		});

		assert.equal(counterBtn.textContent, '1');

		flushSync(() => {
			counterBtn.click();
		});

		assert.equal(counterBtn.textContent, '2');
	}
});
