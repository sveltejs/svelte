import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['async-server', 'client', 'hydrate'],
	ssrHtml: `<h1>Hello, world!</h1> 5 01234 5 sync 6 5 0 10`,

	async test({ assert, target }) {
		await tick();

		assert.htmlEqual(target.innerHTML, `<h1>Hello, world!</h1> 5 01234 5 sync 6 5 0 10`);
	}
});
