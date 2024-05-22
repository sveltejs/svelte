import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `child: 0 parent: 0 <button>inc x</button>`,

	test({ assert, target }) {
		target.querySelector('button')?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `child: 1 parent: 1 <button>inc x</button>`);
	}
});
