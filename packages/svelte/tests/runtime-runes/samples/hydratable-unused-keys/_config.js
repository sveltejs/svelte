import { tick } from 'svelte';
import { ok, test } from '../../test';

export default test({
	skip_no_async: true,
	mode: ['async-server', 'hydrate'],

	server_props: { environment: 'server' },
	ssrHtml: '<div>Loading...</div>',

	async test({ assert, target }) {
		// let it hydrate and resolve the promise on the client
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			'<div>did you ever hear the tragedy of darth plagueis the wise?</div>'
		);
	}
});
