import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>add</button> <p>1</p><p>1</p><p>1</p>`,

	test({ assert, target }) {
		const btn = target.querySelector('button');

		flushSync(() => {
			btn?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<button>add</button> <p>1</p><p>2</p><p>1</p><p>2</p><p>1</p><p>2</p>`
		);
	}
});
