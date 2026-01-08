import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	skip_no_async: true,
	async test({ assert, target }) {
		const [fork_btn, counter_btn] = target.querySelectorAll('button');

		flushSync(() => {
			fork_btn.click();
		});

		assert.equal(counter_btn.textContent, '0');

		flushSync(() => {
			counter_btn.click();
		});

		assert.equal(counter_btn.textContent, '1');

		flushSync(() => {
			counter_btn.click();
		});

		assert.equal(counter_btn.textContent, '2');
	}
});
