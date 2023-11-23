import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const input = target.querySelector('input');

		flushSync(() => {
			input?.click();
		});

		assert.htmlEqual(target.innerHTML, `<input>`);
	}
});
