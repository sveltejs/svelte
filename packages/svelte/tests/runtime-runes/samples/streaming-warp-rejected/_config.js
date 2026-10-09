import { test } from '../../test';

export default test({
	skip_no_async: true,
	mode: ['async-server', 'hydrate'],
	compileOptions: {
		experimental: { async: true, streaming: true }
	},

	server_props: { environment: 'server' },
	props: { environment: 'browser' },
	ssrHtml: '<p>loading</p>',

	transformError: (error) =>
		error instanceof Error ? { message: error.message.toUpperCase() } : error,

	async test({ assert, target }) {
		await new Promise((fulfil) => setTimeout(fulfil, 50));

		// the rejection happened in the background on the server, and was streamed through `transformError`
		assert.htmlEqual(target.innerHTML, '<p>failed: FROM SERVER</p>');
	}
});
