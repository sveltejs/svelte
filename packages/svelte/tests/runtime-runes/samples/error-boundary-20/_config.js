import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, errors }) {
		let btn = target.querySelector('button');

		btn?.click();
		flushSync();

		assert.equal(errors.length, 1);

		assert.htmlEqual(target.innerHTML, `<div class="error">An error occurred!</div>`);
	}
});
