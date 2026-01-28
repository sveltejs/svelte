import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	async test({ assert, target, window }) {
		const [btn1, btn2] = target.querySelectorAll('button');
		const p = target.querySelector('p');

		assert.equal(p?.innerHTML, '');

		flushSync(() => {
			btn2.click();
		});

		assert.equal(p?.innerHTML, '1');

		flushSync(() => {
			btn1.click();
		});

		assert.equal(p?.innerHTML, '1');

		flushSync(() => {
			btn2.click();
		});

		assert.equal(p?.innerHTML, '2');
	}
});
