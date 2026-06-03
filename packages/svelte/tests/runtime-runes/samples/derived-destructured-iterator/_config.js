import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>increment</button><p>a: 1</p><p>b: 2</p><p>c: 3</p>`,

	test({ assert, target }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());
		assert.htmlEqual(
			target.innerHTML,
			`<button>increment</button><p>a: 2</p><p>b: 3</p><p>c: 4</p>`
		);
	}
});
