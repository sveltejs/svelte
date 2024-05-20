import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>hello!</button>`,

	test({ assert, target }) {
		const btn = target.querySelector('button');

		flushSync(() => {
			btn?.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>goodbye!</button>`);
	}
});
