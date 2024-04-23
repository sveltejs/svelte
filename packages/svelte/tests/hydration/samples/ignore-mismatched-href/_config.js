import { test } from '../../test';

export default test({
	server_props: {
		browser: false
	},

	props: {
		browser: true
	},

	test(assert, target) {
		assert.equal(target.querySelector('a')?.getAttribute('href'), '/bar');
	},

	errors: [
		'Detected a href attribute value change during hydration. This will not be repaired during hydration, the href value that came from the server will be used. Related element:'
	]
});
