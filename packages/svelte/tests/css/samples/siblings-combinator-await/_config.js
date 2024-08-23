import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".a + .e"',
			start: { character: 242, column: 1, line: 14 },
			end: { character: 249, column: 8, line: 14 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".b + .c"',
			start: { character: 269, column: 1, line: 15 },
			end: { character: 276, column: 8, line: 15 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".c + .d"',
			start: { character: 296, column: 1, line: 16 },
			end: { character: 303, column: 8, line: 16 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".b + .d"',
			start: { character: 323, column: 1, line: 17 },
			end: { character: 330, column: 8, line: 17 }
		}
	]
});
