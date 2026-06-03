import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'async-server'],
	ssrHtml: `<p>hello world</p>`,
	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>hello world</p>');
	}
});
