import { tick } from 'svelte';
import { ok, test } from '../../test';

export default test({
	skip_no_async: true,
	skip_mode: ['server'],

	server_props: { environment: 'server' },
	ssrHtml: '<p>1 server</p>',

	props: { environment: 'browser' },

	async test({ assert, target, variant }) {
		await tick();
		const p = target.querySelector('p');
		ok(p);
		if (variant === 'hydrate') {
			assert.htmlEqual(p.outerHTML, '<p>1 server</p>');
		} else {
			assert.htmlEqual(p.outerHTML, '<p>1 browser</p>');
		}
	}
});
