import { test } from '../../test';

// even {#if true} or {#if false} should be kept as an if block, because it could be {#if browser} originally,
// which is then different between client and server.
export default test({
	trim_whitespace: false
});
