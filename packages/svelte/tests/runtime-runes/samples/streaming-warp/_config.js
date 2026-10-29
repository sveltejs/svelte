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

		// when hydrating, the data loaded on the server (inside the pending boundary) is streamed to the client
		assert.htmlEqual(
			target.innerHTML,
			variant === 'hydrate' ? '<p>from server</p>' : '<p>from browser</p>'
		);
	}
});
