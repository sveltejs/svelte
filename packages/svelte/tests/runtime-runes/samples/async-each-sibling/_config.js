import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['async-server', 'hydrate', 'client'],
	ssrHtml: `<ul><li>1</li></ul> <button>add</button>`,

	async test({ assert, target }) {
		await tick();
		const [add] = target.querySelectorAll('button');

		add.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<ul><li>1</li><li>2</li></ul> <button>add</button>`);
	}
});
