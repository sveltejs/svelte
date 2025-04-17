import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ target, assert }) {
		// Test for https://github.com/sveltejs/svelte/issues/15237
		const [setValues, clearValue] = target.querySelectorAll('button');
		const [text1, text2, check1, check2] = target.querySelectorAll('input');

		assert.equal(text1.value, '');
		assert.equal(text2.value, '');
		assert.equal(check1.checked, false);
		assert.equal(check2.checked, false);

		flushSync(() => {
			setValues.click();
		});

		assert.equal(text1.value, 'message');
		assert.equal(text2.value, 'message');
		assert.equal(check1.checked, true);
		assert.equal(check2.checked, true);

		flushSync(() => {
			clearValue.click();
		});

		assert.equal(text1.value, '');
		assert.equal(text2.value, '');
		assert.equal(check1.checked, false);
		assert.equal(check2.checked, false);
	}
});
