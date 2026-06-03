import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip_no_async: true,
	mode: ['async-server', 'hydrate'],

	server_props: { environment: 'server' },
	ssrHtml:
		'<div>did you ever hear the tragedy of darth plagueis the wise?</div><div>Loading...</div>',

	test_ssr({ assert, warnings }) {
		assert.strictEqual(warnings.length, 1);
		// for some strange reason we trim the error code off the beginning of warnings so I can't actually assert it
		assert.include(warnings[0], 'A `hydratable` value with key `partially_used`');
	},

	async test({ assert, target }) {
		// make sure the hydratable promise on the client has a chance to run and reject (it shouldn't, because the server data should be used)
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			'<div>did you ever hear the tragedy of darth plagueis the wise?</div><div>no, sith daddy, please tell me</div>'
		);
	}
});
