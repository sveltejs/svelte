import { test } from '../../test';

export default test({
	server_props: {
		lang: 'en'
	},

	props: {
		lang: 'de'
	},

	test(assert, target) {
		assert.htmlEqual(target.ownerDocument.documentElement.lang, 'de');
	}
});
