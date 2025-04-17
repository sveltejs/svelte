import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".b ~ .c"',
			start: { character: 191, column: 1, line: 13 },
			end: { character: 198, column: 8, line: 13 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".c ~ .f"',
			start: { character: 216, column: 1, line: 14 },
			end: { character: 223, column: 8, line: 14 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".b ~ .f"',
			start: { character: 241, column: 1, line: 15 },
			end: { character: 248, column: 8, line: 15 }
		}
	]
});
