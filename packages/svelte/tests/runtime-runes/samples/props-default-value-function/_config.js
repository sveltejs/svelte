import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	test({ assert, target }) {
		const btn = target.querySelector('button');

		assert.htmlEqual(target.innerHTML, `<button>inc</button> Inner: 0 Inner: 0`);
		btn?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>inc</button> Inner: 1 Inner: 1`);
	}
});
