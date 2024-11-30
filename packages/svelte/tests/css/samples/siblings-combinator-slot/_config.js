import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".b + .c"',
			start: { character: 110, column: 1, line: 10 },
			end: { character: 117, column: 8, line: 10 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".c + .f"',
			start: { character: 135, column: 1, line: 11 },
			end: { character: 142, column: 8, line: 11 }
		}
	]
});
