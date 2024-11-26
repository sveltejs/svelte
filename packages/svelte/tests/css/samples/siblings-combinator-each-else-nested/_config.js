import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".a + .c"',
			start: { character: 586, column: 1, line: 27 },
			end: { character: 593, column: 8, line: 27 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".b + .e"',
			start: { character: 611, column: 1, line: 28 },
			end: { character: 618, column: 8, line: 28 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".d + .d"',
			start: { character: 636, column: 1, line: 29 },
			end: { character: 643, column: 8, line: 29 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".e + .f"',
			start: { character: 661, column: 1, line: 30 },
			end: { character: 668, column: 8, line: 30 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".f + .f"',
			start: { character: 686, column: 1, line: 31 },
			end: { character: 693, column: 8, line: 31 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".g + .h + .i + .j"',
			start: { character: 711, column: 1, line: 32 },
			end: { character: 728, column: 18, line: 32 }
		}
	]
});
