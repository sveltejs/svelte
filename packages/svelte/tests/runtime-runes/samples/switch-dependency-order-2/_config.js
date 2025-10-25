import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, window }) {
		const [btn1] = target.querySelectorAll('button');

		assert.htmlEqual(window.document.head.innerHTML, ``);

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(window.document.head.innerHTML, `<title>hello world</title>`);

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(window.document.head.innerHTML, `<title>hello world</title>`);
	}
});
