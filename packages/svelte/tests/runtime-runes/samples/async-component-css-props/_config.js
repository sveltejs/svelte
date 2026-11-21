import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['async-server', 'client', 'hydrate'],
	ssrHtml:
		'<svelte-css-wrapper style="display: contents; --width: 10rem;"><p>child</p></svelte-css-wrapper>',

	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<svelte-css-wrapper style="display: contents; --width: 10rem;"><p>child</p></svelte-css-wrapper>'
		);
	}
});
