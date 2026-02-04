import { test } from '../../test';

export default test({
	mode: ['server'],
	test_ssr({ assert, html }) {
		assert.htmlEqualWithOptions(html.body, '<!--[--><!--[--><!---->1<!---->2<!--]--><!--]-->', {
			preserveComments: true,
			withoutNormalizeHtml: true
		});
	}
});
