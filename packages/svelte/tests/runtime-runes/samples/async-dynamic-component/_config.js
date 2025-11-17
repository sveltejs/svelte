import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['async-server', 'client', 'hydrate'],
	ssrHtml: 'Hi Hi Hi Hi',
	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, 'Hi Hi Hi Hi');
	}
});
