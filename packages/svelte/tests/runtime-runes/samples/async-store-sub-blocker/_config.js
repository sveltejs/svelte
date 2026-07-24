import { tick } from 'svelte';
import { test } from '../../test';

// Tests that a store subscription only present in the template waits for the
// promise that assigns the store instead of subscribing to `undefined`.
export default test({
	mode: ['client', 'hydrate', 'async-server'],
	ssrHtml: '<p>hello</p>',
	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>hello</p>');
	}
});
