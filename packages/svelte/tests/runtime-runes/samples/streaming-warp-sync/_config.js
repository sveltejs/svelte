import { test } from '../../test';

export default test({
	skip_no_async: true,
	mode: ['async-server', 'hydrate', 'client'],
	compileOptions: {
		experimental: { async: true, streaming: true }
	},

	server_props: { environment: 'server' },
	props: { environment: 'browser' },
	ssrHtml: '<p>loading</p>',

	async test({ assert, target, variant }) {
		await new Promise((fulfil) => setTimeout(fulfil, 50));

		// when hydrating, the boundary waits for the value that its children read synchronously, which
		// was added on the server (inside the pending boundary) and is streamed to the client
		assert.htmlEqual(
			target.innerHTML,
			variant === 'hydrate' ? '<p>hello from server</p>' : '<p>hello from browser</p>'
		);
	}
});
