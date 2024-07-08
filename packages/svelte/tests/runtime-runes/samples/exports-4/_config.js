import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, `0 0 <button>0 / 0</button>`);
		const btn = target.querySelector('button');

		flushSync(() => btn?.click());
		assert.htmlEqual(target.innerHTML, '1 2 <button>1 / 2</button>');
	}
});
