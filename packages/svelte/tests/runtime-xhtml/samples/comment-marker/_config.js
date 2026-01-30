import { getSsrHtml, test } from '../../test';

export default test({
	mode: ['server'],
	test_ssr({ assert }) {
		const html = getSsrHtml(import.meta.dirname);
		assert.htmlEqualWithOptions(html, '<!--[--><!--[-->foo<!--]--><!--]-->', {
			preserveComments: true,
			withoutNormalizeHtml: true
		});
	}
});
