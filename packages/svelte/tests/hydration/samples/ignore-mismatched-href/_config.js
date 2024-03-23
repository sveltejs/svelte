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
	}
});
