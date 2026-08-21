import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target, raf }) {
		const btn = target.querySelector('button');

		// one tick to not be at 0. Else the flushSync would revert the in-transition which hasn't started, and directly remove the button
		raf.tick(1);

		flushSync(() => {
			btn?.click();
		});

		assert.htmlEqual(target.innerHTML, `<h1>Outside</h1><button style="opacity: 0;">Hide</button>`);

		raf.tick(101);

		assert.htmlEqual(target.innerHTML, `<h1>Outside</h1>`);
	}
});
