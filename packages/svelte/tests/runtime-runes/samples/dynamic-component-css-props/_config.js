import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			`<svelte-css-wrapper style="display: contents; --color: red;"><div class="svelte-lsmn3l">Hello</div></svelte-css-wrapper>`
		);
	}
});
