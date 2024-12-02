import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".b ~ .c"',
			start: { character: 137, column: 1, line: 11 },
			end: { character: 144, column: 8, line: 11 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".c ~ .f"',
			start: { character: 162, column: 1, line: 12 },
			end: { character: 169, column: 8, line: 12 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".f ~ .g"',
			start: { character: 187, column: 1, line: 13 },
			end: { character: 194, column: 8, line: 13 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".b ~ .f"',
			start: { character: 212, column: 1, line: 14 },
			end: { character: 219, column: 8, line: 14 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".b ~ .g"',
			start: { character: 237, column: 1, line: 15 },
			end: { character: 244, column: 8, line: 15 }
		}
	]
});
