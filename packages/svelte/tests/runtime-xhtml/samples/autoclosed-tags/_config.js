import { test } from '../../test';

const expected = [
	`<ul><li></li><li></li></ul>`,
	`<dl><dt></dt><dd></dd><dd></dd></dl>`,
	`<p></p><p></p><div></div>`,
	`<ruby><rp></rp><rt></rt><rt></rt></ruby>`,
	`<select><option></option><optgroup></optgroup><optgroup></optgroup></select>`,
	`<table><thead></thead><tbody></tbody><tfoot></tfoot><tbody><tr><td></td><th></th></tr><tr></tr></tbody></table>`
].join(' ');

export default test({
	mode: ['server'],
	test_ssr({ assert, html }) {
		assert.htmlEqualWithOptions(html.body, expected, {
			preserveComments: false,
			withoutNormalizeHtml: true
		});
	}
});
