import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['hydrate'],
	ssrHtml: '<p>failed: error</p> <button>reset</button>',
	transformError: () => 'error',

	test({ assert, target }) {
		const btn = target.querySelector('button');
		btn?.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, '<p>recovered</p>');
	}
});
