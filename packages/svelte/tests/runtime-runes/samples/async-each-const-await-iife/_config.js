import { tick } from 'svelte';
import { test } from '../../test';

// Tests that an IIFE referencing an `await` @const inside an {#each} block
// correctly registers the async dependency so the template waits for the
// resolved value instead of rendering with `undefined`.
export default test({
	mode: ['client', 'hydrate', 'async-server'],
	ssrHtml: '<p>example.com</p>',
	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>example.com</p>');
	}
});
