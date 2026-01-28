import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>false</button>`,
	test({ assert, target }) {
		target.querySelector('button')?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>true</button>`);
	}
});
