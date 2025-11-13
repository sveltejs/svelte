import { tick } from 'svelte';
import { ok, test } from '../../test';

export default test({
	skip_mode: ['server'],

	server_props: { environment: 'server' },
	ssrHtml: '<p>The current environment is: server</p>',

	props: { environment: 'browser' },
	html: '<p>The current environment is: server</p>',

	async test({ assert, target }) {
		await tick();
		const p = target.querySelector('p');
		ok(p);
		assert.htmlEqual(p.outerHTML, '<p>The current environment is: server</p>');
	}
});
