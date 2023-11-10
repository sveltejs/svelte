import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector "article > *"',
			start: { character: 10, column: 1, line: 2 },
			end: { character: 21, column: 12, line: 2 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector "article *"',
			start: { character: 49, column: 1, line: 6 },
			end: { character: 58, column: 10, line: 6 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".article > *"',
			start: { character: 86, column: 1, line: 10 },
			end: { character: 98, column: 13, line: 10 }
		}
	]
});
