import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>mutate</button> <p>1 1</p>`,

	test({ assert, target }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());

		assert.htmlEqual(target.innerHTML, `<button>mutate</button> <p>1 1</p>`);
	}
});
