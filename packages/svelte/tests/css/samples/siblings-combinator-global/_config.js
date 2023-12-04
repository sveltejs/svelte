import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ":global(input) + span"',
			start: {
				character: 239,
				column: 2,
				line: 9
			},
			end: {
				character: 260,
				column: 23,
				line: 9
			}
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ":global(input) ~ span"',
			start: {
				character: 279,
				column: 2,
				line: 10
			},
			end: {
				character: 300,
				column: 23,
				line: 10
			}
		}
	]
});
