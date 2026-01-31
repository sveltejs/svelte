import { test } from '../../test';

export default test({
	skip: true,
	mode: ['server'],
	test_ssr({ assert, html }) {
		assert.htmlEqualWithOptions(html.body, `<input disabled="" hidden=""/>`, {
			preserveComments: false,
			withoutNormalizeHtml: true
		});
	}
});
