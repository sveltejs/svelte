import { test } from '../../test';

export default test({
	mode: ['hydrate'],

	server_props: {
		browser: false
	},

	props: {
		browser: true
	},

	test({ assert, target }) {
		assert.equal(target.querySelector('link')?.getAttribute('href'), '/bar');
	},

	warnings: [
		'The `href` attribute on `<link xmlns="http://www.w3.org/1999/xhtml" href="/bar" />` changed its value between server and client renders. The client value, `/foo`, will be ignored in favour of the server value'
	]
});
