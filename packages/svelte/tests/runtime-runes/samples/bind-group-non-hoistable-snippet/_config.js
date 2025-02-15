import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [radio1, radio2] = target.querySelectorAll('input');
		const p = target.querySelector('p');

		assert.equal(p?.innerHTML, '');
		flushSync(() => {
			radio1.click();
		});
		assert.equal(p?.innerHTML, 'cool');
		flushSync(() => {
			radio2.click();
		});
		assert.equal(p?.innerHTML, 'cooler');
	}
});
