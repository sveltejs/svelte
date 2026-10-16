import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: { customElement: true },
	mode: ['client', 'hydrate', 'server', 'async-server'],
	html: '<x-mini-ssr></x-mini-ssr>'.repeat(4),
	async test({ assert, target }) {
		await tick();
		for (const element of target.querySelectorAll('x-mini-ssr')) {
			assert.htmlEqual(element.shadowRoot?.innerHTML ?? '', '<p>hello: a, b</p>');
		}
	}
});
