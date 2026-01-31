import { test } from '../../test';

export default test({
	mode: ['server'],
	test_ssr({ assert, html }) {
		assert.htmlEqualWithOptions(html.body, '<!--[--><!--[-->foo<!--]--><!--]-->', {
			preserveComments: true,
			withoutNormalizeHtml: true
		});
	}
});
