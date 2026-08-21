import { test } from '../../test';

export default test({
	ssrHtml: `<svelte-css-wrapper style="display: contents; --zero: 0; --one: 1;"><div>Hello</div></svelte-css-wrapper>`,

	async test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			`<svelte-css-wrapper style="display: contents; --zero: 0; --one: 1;"><div>Hello</div></svelte-css-wrapper>`
		);
	}
});
