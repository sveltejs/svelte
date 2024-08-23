import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const [btn1, btn2, btn3] = target.querySelectorAll('button');

		flushSync(() => btn3.click());
		assert.htmlEqual(/** @type {string} */ (btn3.textContent), 'clicks: 1');

		flushSync(() => btn2.click());
		flushSync(() => btn3.click());
		assert.htmlEqual(/** @type {string} */ (btn3.textContent), 'clicks: 0');

		flushSync(() => btn1.click());
		flushSync(() => btn3.click());
		assert.htmlEqual(/** @type {string} */ (btn3.textContent), 'clicks: 1');
	}
});
