import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	immutable: true,

	test({ assert, target }) {
		const btn = target.querySelector('button');

		flushSync(() => {
			btn?.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>Update</button><ul><li>test !!!</li></ul>`);
	}
});
