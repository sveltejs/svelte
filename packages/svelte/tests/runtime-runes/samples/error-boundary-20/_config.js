import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		let btn = target.querySelector('button');

		btn?.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, `<div class="error">An error occurred!</div>`);
	}
});
