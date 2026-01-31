import { test } from '../../test';

const expected = [
	`<area alt=""/>`,
	`<base/>`,
	`<br/>`,
	`<col/>`,
	// `<command/>`, - deprecated and not void tag in jsdom
	`<embed/>`,
	`<hr/>`,
	`<img alt=""/>`,
	`<input/>`,
	`<keygen/>`,
	`<link/>`,
	`<meta/>`,
	`<param/>`,
	`<source/>`,
	`<track/>`,
	`<wbr/>`
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
