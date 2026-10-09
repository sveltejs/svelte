import { test } from '../../test';

export default test({
	skip_no_async: true,
	mode: ['async-server', 'hydrate'],

	server_props: { environment: 'server' },
	props: { environment: 'browser' },
	ssrHtml: '<p>loading</p>',

	transformError: (error) =>
		error instanceof Error ? { message: error.message.toUpperCase() } : error,

	test_ssr({ assert, warnings }) {
		assert.strictEqual(warnings.length, 1);
		assert.include(warnings[0], 'The value with key `data` in `Warp` `app`');
	},

	async test({ assert, target }) {
		await new Promise((fulfil) => setTimeout(fulfil, 10));

		// the client uses the rejection from the server, passed through `transformError`
		assert.htmlEqual(target.innerHTML, '<p>failed: FROM SERVER</p>');
	}
});
