import { test } from '../../test';

export default test({
	mode: ['server'],
	test_ssr({ assert, html }) {
		assert.htmlEqualWithOptions(html.body, `<div foo="bar"></div> <div foo="bar baz"></div>`, {
			preserveComments: false,
			withoutNormalizeHtml: true
		});
	}
});
