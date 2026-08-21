import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['async-server', 'hydrate', 'client'],
	ssrHtml: `bar blocking`,

	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, 'bar blocking');
	}
});
