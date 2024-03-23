import { test } from '../../test';

// even {#if true} or {#if false} should be kept as an if block, because it could be {#if browser} originally,
// which is then different between client and server.
export default test({
	server_props: {
		condition: false
	},

	props: {
		condition: true
	},

	trim_whitespace: false
});
