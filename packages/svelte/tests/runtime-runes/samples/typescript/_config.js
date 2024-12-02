import { flushSync } from 'svelte';
import { test } from '../../test';

// This test mainly checks that all types are properly ignored by the compiler
export default test({
	html: '<button>clicks: 0</button>',

	test({ assert, target }) {
		const btn = target.querySelector('button');
		btn?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>clicks: 1</button>`);
	}
});
