import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ":root .unused"',
			start: {
				line: 18,
				column: 2,
				character: 190
			},
			end: {
				line: 18,
				column: 15,
				character: 203
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ":root:has(.unused)"',
			start: {
				line: 25,
				column: 2,
				character: 269
			},
			end: {
				line: 25,
				column: 20,
				character: 287
			}
		}
	]
});
