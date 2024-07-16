import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".b ~ .c"',
			start: { character: 217, column: 1, line: 13 },
			end: { character: 224, column: 8, line: 13 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".c ~ .d"',
			start: { character: 242, column: 1, line: 14 },
			end: { character: 249, column: 8, line: 14 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".b ~ .d"',
			start: { character: 267, column: 1, line: 15 },
			end: { character: 274, column: 8, line: 15 }
		}
	]
});
