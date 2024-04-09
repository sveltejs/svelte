import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".a ~ .b"',
			start: { character: 110, column: 1, line: 10 },
			end: { character: 117, column: 8, line: 10 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".b ~ .c"',
			start: { character: 137, column: 1, line: 11 },
			end: { character: 144, column: 8, line: 11 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".c ~ .f"',
			start: { character: 164, column: 1, line: 12 },
			end: { character: 171, column: 8, line: 12 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".f ~ .g"',
			start: { character: 191, column: 1, line: 13 },
			end: { character: 198, column: 8, line: 13 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".b ~ .f"',
			start: { character: 218, column: 1, line: 14 },
			end: { character: 225, column: 8, line: 14 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".b ~ .g"',
			start: { character: 245, column: 1, line: 15 },
			end: { character: 252, column: 8, line: 15 }
		}
	]
});
