import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	ssrHtml: '<button>fulfil</button><p>42</p><hr><p>loading...</p>',
	html: '<button>fulfil</button><p>loading...</p><hr><p>42</p>',

	props: {
		browser: true
	},

	server_props: {
		browser: false
	},

	async test({ assert, target }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<button>fulfil</button><p>42</p><hr><p>42</p>');
	}
});
