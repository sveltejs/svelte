import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target, raf }) {
		const btn = target.querySelector('button');

		raf.tick(0);
		btn?.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<button>Toggle</button> <div style="opacity: 0;">DIV</div>`
		);

		raf.tick(100);

		assert.htmlEqual(target.innerHTML, `<button>Toggle</button> <div style="">DIV</div>`);
	}
});
