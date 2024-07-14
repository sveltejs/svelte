import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".a + .e"',
			start: { character: 188, column: 1, line: 10 },
			end: { character: 195, column: 8, line: 10 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".b + .c"',
			start: { character: 213, column: 1, line: 11 },
			end: { character: 220, column: 8, line: 11 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".c + .d"',
			start: { character: 238, column: 1, line: 12 },
			end: { character: 245, column: 8, line: 12 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".b + .d"',
			start: { character: 263, column: 1, line: 13 },
			end: { character: 270, column: 8, line: 13 }
		}
	]
});
