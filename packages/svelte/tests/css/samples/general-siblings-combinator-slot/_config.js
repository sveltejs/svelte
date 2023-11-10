import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".a ~ .b"',
			start: { character: 111, column: 1, line: 10 },
			end: { character: 118, column: 8, line: 10 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".b ~ .c"',
			start: { character: 138, column: 1, line: 11 },
			end: { character: 145, column: 8, line: 11 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".c ~ .f"',
			start: { character: 165, column: 1, line: 12 },
			end: { character: 172, column: 8, line: 12 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".f ~ .g"',
			start: { character: 192, column: 1, line: 13 },
			end: { character: 199, column: 8, line: 13 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".b ~ .f"',
			start: { character: 219, column: 1, line: 14 },
			end: { character: 226, column: 8, line: 14 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".b ~ .g"',
			start: { character: 246, column: 1, line: 15 },
			end: { character: 253, column: 8, line: 15 }
		}
	]
});
