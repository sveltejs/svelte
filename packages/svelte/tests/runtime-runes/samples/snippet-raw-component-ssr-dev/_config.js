import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	props: {
		browser: true
	},

	server_props: {
		browser: false
	},
	compileOptions: {
		dev: true
	},
	html: `<div><div><button>clicks: 0</button></div></div>`,

	test({ target, assert }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());
		assert.htmlEqual(target.innerHTML, `<div><div><button>clicks: 1</button></div></div>`);
	}
});
