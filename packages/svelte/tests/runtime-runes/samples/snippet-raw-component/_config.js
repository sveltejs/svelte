import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	props: {
		browser: true
	},

	server_props: {
		browser: false
	},

	html: `<div><button>clicks: 0</button></div>`,

	test({ target, assert }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());
		assert.htmlEqual(target.innerHTML, `<div><button>clicks: 1</button></div>`);
	}
});
