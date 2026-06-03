import { ok, test } from '../../test';

export default test({
	skip_no_async: true,
	skip_mode: ['server'],

	server_props: { environment: 'server' },
	ssrHtml: '<p>The current environment is: server</p>',

	props: { environment: 'browser' },

	async test({ assert, target, variant }) {
		const p = target.querySelector('p');
		ok(p);
		if (variant === 'hydrate') {
			assert.htmlEqual(p.outerHTML, '<p>The current environment is: server</p>');
		} else {
			assert.htmlEqual(p.outerHTML, '<p>The current environment is: browser</p>');
		}
	}
});
