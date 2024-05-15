import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const btn = target.querySelector('button');

		flushSync(() => {
			btn?.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>Toggle</button><h1>Style: not red</h1>`);

		flushSync(() => {
			btn?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>Toggle</button><h1 data-red="true">Style: red</h1>`
		);
	}
});
