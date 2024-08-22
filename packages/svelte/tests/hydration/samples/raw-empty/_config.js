import { test } from '../../test';

export default test({
	server_props: {
		html: '<div></div>'
	},

	props: {
		html: '<div></div>'
	},

	test(assert, target) {
		assert.htmlEqual(target.innerHTML, '<div></div>');
	}
});
