import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "article > *"',
			start: { character: 9, column: 1, line: 2 },
			end: { character: 20, column: 12, line: 2 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "article *"',
			start: { character: 47, column: 1, line: 6 },
			end: { character: 56, column: 10, line: 6 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".article > *"',
			start: { character: 83, column: 1, line: 10 },
			end: { character: 95, column: 13, line: 10 }
		}
	]
});
