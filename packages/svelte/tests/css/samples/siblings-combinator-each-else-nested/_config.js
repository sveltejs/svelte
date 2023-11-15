import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".a + .c"',
			start: { character: 479, column: 1, line: 23 },
			end: { character: 486, column: 8, line: 23 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".a + .g"',
			start: { character: 506, column: 1, line: 24 },
			end: { character: 513, column: 8, line: 24 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".b + .e"',
			start: { character: 533, column: 1, line: 25 },
			end: { character: 540, column: 8, line: 25 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".c + .g"',
			start: { character: 560, column: 1, line: 26 },
			end: { character: 567, column: 8, line: 26 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".c + .k"',
			start: { character: 587, column: 1, line: 27 },
			end: { character: 594, column: 8, line: 27 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".d + .d"',
			start: { character: 614, column: 1, line: 28 },
			end: { character: 621, column: 8, line: 28 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".e + .f"',
			start: { character: 641, column: 1, line: 29 },
			end: { character: 648, column: 8, line: 29 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".f + .f"',
			start: { character: 668, column: 1, line: 30 },
			end: { character: 675, column: 8, line: 30 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".g + .j"',
			start: { character: 695, column: 1, line: 31 },
			end: { character: 702, column: 8, line: 31 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".g + .h + .i + .j"',
			start: { character: 722, column: 1, line: 32 },
			end: { character: 739, column: 18, line: 32 }
		}
	]
});
