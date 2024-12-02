import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button class="foo">0</button><button class="foo">0</button>`,

	test({ assert, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		flushSync(() => {
			btn1?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button class="foo">1</button><button class="foo">1</button>`
		);

		flushSync(() => {
			btn2?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button class="foo">2</button><button class="foo">2</button>`
		);
	}
});
