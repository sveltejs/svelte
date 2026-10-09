import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip_no_async: true,
	mode: ['async-server', 'hydrate'],

	server_props: { environment: 'server' },
	ssrHtml: '<div>Loading...</div>',

	test_ssr({ assert, warnings }) {
		assert.strictEqual(warnings.length, 1);
		assert.include(warnings[0], 'The value with key `unused_key` in `Warp` `app`');
	},

	async test({ assert, target }) {
		// make sure the warp promise on the client has a chance to run and reject (it shouldn't, because the server data should be used)
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			'<div>did you ever hear the tragedy of darth plagueis the wise?</div>'
		);
	}
});
