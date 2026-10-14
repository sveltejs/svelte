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
		await new Promise((fulfil) => setTimeout(fulfil, 100));

		// the second value is added on the server after the first resolves, and still reaches the client
		assert.htmlEqual(
			target.innerHTML,
			variant === 'hydrate'
				? '<p>server: posts from server</p>'
				: '<p>browser: posts from browser</p>'
		);
	}
});
