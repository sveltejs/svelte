import { ok, test } from '../../test';

export default test({
	mode: ['async-server', 'hydrate'],

	server_props: { environment: 'server' },
	ssrHtml: '<p>The current environment is: server</p>',

	props: { environment: 'browser' },

	runtime_error: 'hydratable_missing_but_expected_e'
});
