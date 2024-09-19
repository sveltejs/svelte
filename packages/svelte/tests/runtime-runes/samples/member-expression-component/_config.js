import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>flip</button> <span>0</span><span>1</span><span>2</span>`,

	async test({ assert, target }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());
		assert.htmlEqual(
			target.innerHTML,
			`<button>flip</button> <span>2</span><span>1</span><span>0</span>`
		);
	}
});
