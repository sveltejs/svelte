import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>Click</button><p>expires in 1 click</p>`,

	async test({ assert, target }) {
		const [btn1] = target.querySelectorAll('button');

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(target.innerHTML, ``);
	}
});
