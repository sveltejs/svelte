import { test } from '../../test';

export default test({
	expected: {
		distinct_modules: true,
		same_attributes_same_module: true,
		attribute_order_ignored: true,
		client_source: true,
		server_source: true,
		module_source: true,
		errors: [
			'Invalid "as" import attribute for App.svelte: expected "module" or "source", got "nope"',
			'Invalid "generate" import attribute for App.svelte: expected "client" or "server", got "nope"',
			'Unsupported import attribute "dev" for App.svelte: only "as" and "generate" are supported'
		]
	}
});
