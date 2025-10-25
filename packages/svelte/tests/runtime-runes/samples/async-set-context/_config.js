import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'async-server'],
	ssrHtml: `<p>hi</p>`,
	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>hi</p>');
	}
});
