import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button><span>hidden</span></button>`,

	async test({ assert, target }) {
		const [b1] = target.querySelectorAll('button');

		flushSync(() => {
			b1?.click();
		});

		assert.htmlEqual(target.innerHTML, `<button><span>showing</span></button>`);
	}
});
