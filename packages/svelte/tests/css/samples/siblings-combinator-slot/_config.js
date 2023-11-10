import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".a + .b"',
			start: { character: 84, column: 1, line: 9 },
			end: { character: 91, column: 8, line: 9 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".b + .c"',
			start: { character: 111, column: 1, line: 10 },
			end: { character: 118, column: 8, line: 10 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".c + .f"',
			start: { character: 138, column: 1, line: 11 },
			end: { character: 145, column: 8, line: 11 }
		}
	]
});
