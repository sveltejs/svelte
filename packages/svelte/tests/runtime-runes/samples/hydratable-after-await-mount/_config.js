import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip_no_async: true,
	skip_mode: ['server'],

	server_props: { environment: 'server' },
	ssrHtml: '<p>parent</p>',

	props: { environment: 'browser' },

	async test({ assert, target, logs }) {
		await tick();

		// `Child` is mounted by a hydrating component after its top-level `await`, but isn't
		// hydrated itself, so it must not read (or require) the server's `hydratable` values
		assert.htmlEqual(target.innerHTML, '<p>parent</p>');
		assert.deepEqual(logs, ['browser']);
	}
});
