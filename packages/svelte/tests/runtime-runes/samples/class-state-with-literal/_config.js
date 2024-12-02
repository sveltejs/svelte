import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>false</button>`,

	test({ assert, target }) {
		const btn = target.querySelector('button');

		btn?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>true</button>`);

		btn?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>false</button>`);
	}
});
