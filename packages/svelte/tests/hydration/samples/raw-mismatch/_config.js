import { test } from '../../test';

export default test({
	server_props: {
		html: 'Server'
	},

	props: {
		html: 'Client'
	},

	test(assert, target) {
		// We deliberately don't slow down hydration just for supporting this edge case mismatch.
		// If someone really needs this and workarounds are insufficient we could add something like {@html dynamic ...}
		assert.htmlEqual(target.innerHTML, 'Server');
	},

	errors: [
		'The value of an `{@html ...}` block changed between server and client renders. The client value will be ignored in favour of the server value'
	]
});
