import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "article + div"',
			start: { character: 45, column: 1, line: 5 },
			end: { character: 58, column: 14, line: 5 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "span + article"',
			start: { character: 81, column: 1, line: 8 },
			end: { character: 95, column: 15, line: 8 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "b + article"',
			start: { character: 118, column: 1, line: 11 },
			end: { character: 129, column: 12, line: 11 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "span + div"',
			start: { character: 152, column: 1, line: 14 },
			end: { character: 162, column: 11, line: 14 }
		}
	]
});
