import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target, raf }) {
		const btn = target.querySelector('button');

		raf.tick(0);

		flushSync(() => {
			btn?.click();
		});

		assert.htmlEqual(target.innerHTML, `<h1>Outside</h1><button style="opacity: 0;">Hide</button>`);

		raf.tick(100);

		assert.htmlEqual(target.innerHTML, `<h1>Outside</h1>`);
	}
});
