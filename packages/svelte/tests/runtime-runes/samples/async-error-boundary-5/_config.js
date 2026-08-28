import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['hydrate'],
	server_props: { environment: 'server' },
	props: { environment: 'client' },
	ssrHtml: 'loading inner loading nested',

	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, 'inner failed: oops outer failed: oops');
	}
});
