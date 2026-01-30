import { getSsrHtml, test } from '../../test';

export default test({
	skip: true,
	mode: ['server'],
	test_ssr({ assert }) {
		const html = getSsrHtml(import.meta.dirname);
		assert.htmlEqualWithOptions(html, `<input disabled="" hidden=""/>`, {
			preserveComments: false,
			withoutNormalizeHtml: true
		});
	}
});
