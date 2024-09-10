import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	accessors: false,

	test({ assert, target }) {
		const [btn] = target.querySelectorAll('button');

		btn.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, `<button>change</button>\nbar\nbar`);
	}
});
