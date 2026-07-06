import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ target, assert }) {
		const [btn1, btn2] = target.querySelectorAll('button');
		flushSync(() => btn2.click());
		assert.equal(btn1.textContent, '1');
	}
});
