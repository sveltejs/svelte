import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".a + .b"',
			start: { character: 83, column: 1, line: 9 },
			end: { character: 90, column: 8, line: 9 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".b + .c"',
			start: { character: 110, column: 1, line: 10 },
			end: { character: 117, column: 8, line: 10 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".c + .f"',
			start: { character: 137, column: 1, line: 11 },
			end: { character: 144, column: 8, line: 11 }
		}
	]
});
