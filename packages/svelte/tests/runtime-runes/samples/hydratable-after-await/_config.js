import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip_no_async: true,
	skip_mode: ['server'],

	server_props: { environment: 'server' },
	ssrHtml: '<p>server server</p>',

	props: { environment: 'browser' },

	async test({ assert, target, variant }) {
		await tick();

		if (variant === 'hydrate') {
			assert.htmlEqual(target.innerHTML, '<p>server server</p>');
		} else {
			assert.htmlEqual(target.innerHTML, '<p>browser browser</p>');
		}
	}
});
