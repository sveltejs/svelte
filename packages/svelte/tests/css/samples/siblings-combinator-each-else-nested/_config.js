import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".a + .c"',
			start: { character: 478, column: 1, line: 23 },
			end: { character: 485, column: 8, line: 23 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".a + .g"',
			start: { character: 505, column: 1, line: 24 },
			end: { character: 512, column: 8, line: 24 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".b + .e"',
			start: { character: 532, column: 1, line: 25 },
			end: { character: 539, column: 8, line: 25 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".c + .g"',
			start: { character: 559, column: 1, line: 26 },
			end: { character: 566, column: 8, line: 26 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".c + .k"',
			start: { character: 586, column: 1, line: 27 },
			end: { character: 593, column: 8, line: 27 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".d + .d"',
			start: { character: 613, column: 1, line: 28 },
			end: { character: 620, column: 8, line: 28 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".e + .f"',
			start: { character: 640, column: 1, line: 29 },
			end: { character: 647, column: 8, line: 29 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".f + .f"',
			start: { character: 667, column: 1, line: 30 },
			end: { character: 674, column: 8, line: 30 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".g + .j"',
			start: { character: 694, column: 1, line: 31 },
			end: { character: 701, column: 8, line: 31 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".g + .h + .i + .j"',
			start: { character: 721, column: 1, line: 32 },
			end: { character: 738, column: 18, line: 32 }
		}
	]
});
