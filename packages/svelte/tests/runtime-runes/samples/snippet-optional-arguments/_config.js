import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const count = target.querySelector('button');
		const fallback = target.querySelector('p');

		assert.htmlEqual(count?.innerHTML ?? '', '0');
		assert.htmlEqual(fallback?.innerHTML ?? '', 'fallback');

		count?.click();
		flushSync();
		assert.htmlEqual(count?.innerHTML ?? '', '1');
		assert.htmlEqual(fallback?.innerHTML ?? '', 'fallback');
	}
});
