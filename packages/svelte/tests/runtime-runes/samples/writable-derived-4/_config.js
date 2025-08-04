import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const [btn1, btn2, btn3] = target.getElementsByTagName('button');
		const [div] = target.getElementsByTagName('div');

		flushSync(() => btn1.click());
		assert.equal(div.textContent, '1');
		flushSync(() => btn2.click());
		assert.equal(div.textContent, '1');
		flushSync(() => btn3.click());
		assert.equal(div.textContent, '2');

		flushSync(() => btn1.click());
		assert.equal(div.textContent, '2');
		flushSync(() => btn2.click());
		assert.equal(div.textContent, '2');
		flushSync(() => btn3.click());
		assert.equal(div.textContent, '3');
	}
});
