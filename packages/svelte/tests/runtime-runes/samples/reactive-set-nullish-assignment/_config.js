import { flushSync } from '../../../../src/index-client';
import { test } from '../../test';

export default test({
	html: `<div><button class="svelte-xyz123" type="button">false</button> <button class="svelte-xyz123" type="button">false</button></div>`,

	test({ assert, target }) {
		const [first, second] = target.querySelectorAll('button');

		flushSync(() => first.click());
		assert.htmlEqual(
			target.innerHTML,
			`<div><button class="active svelte-xyz123" type="button">true</button> <button class="active svelte-xyz123" type="button">true</button></div>`
		);

		flushSync(() => second.click());
		assert.htmlEqual(
			target.innerHTML,
			`<div><button class="svelte-xyz123" type="button">false</button> <button class="svelte-xyz123" type="button">false</button></div>`
		);
	}
});
