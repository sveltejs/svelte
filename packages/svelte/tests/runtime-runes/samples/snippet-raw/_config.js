import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true // Render in dev mode to check that the validation error is not thrown
	},

	html: `<button>click</button><p>clicks: 0</p>`,

	test({ target, assert }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());
		assert.htmlEqual(target.innerHTML, `<button>click</button><p>clicks: 1</p>`);
	}
});
