import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		flushSync(() => {
			target.querySelector('button')?.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>0</button>`);
	}
});
