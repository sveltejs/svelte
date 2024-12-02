import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true,
		hmr: true
	},

	html: `<button>toggle</button>`,

	test({ assert, target }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());
		assert.htmlEqual(target.innerHTML, `<button>toggle</button><p>hello</p>`);

		flushSync(() => button?.click());
		assert.htmlEqual(target.innerHTML, `<button>toggle</button>`);
	}
});
