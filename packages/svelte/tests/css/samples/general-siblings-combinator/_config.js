import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector "article ~ div"',
			start: { character: 275, column: 1, line: 12 },
			end: { character: 288, column: 14, line: 12 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector "span ~ article"',
			start: { character: 308, column: 1, line: 13 },
			end: { character: 322, column: 15, line: 13 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector "b ~ article"',
			start: { character: 342, column: 1, line: 14 },
			end: { character: 353, column: 12, line: 14 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector "span ~ div"',
			start: { character: 373, column: 1, line: 15 },
			end: { character: 383, column: 11, line: 15 }
		}
	]
});
