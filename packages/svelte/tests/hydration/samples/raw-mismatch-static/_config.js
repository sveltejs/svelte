import { test } from '../../test';

export default test({
	test(assert, target) {
		// This test case guards against a potential future bug where we could optimize html tags away for static content:
		// Even if the {@html } block seems static, it should be preserved as such, because it could be dynamic originally
		// (like {@html browser ? 'foo' : 'bar'} which is then different between client and server.
		// Also see https://github.com/sveltejs/svelte/issues/8683 where this happened for Svelte 4.
		assert.htmlEqual(target.innerHTML, 'Server');
	},

	errors: [
		'The value of an `{@html ...}` block changed between server and client renders. The client value will be ignored in favour of the server value'
	]
});
