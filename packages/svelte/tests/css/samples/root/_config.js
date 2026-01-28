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
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused"',
			start: {
				line: 37,
				column: 4,
				character: 401
			},
			end: {
				line: 37,
				column: 11,
				character: 408
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ":has(.unused)"',
			start: {
				line: 43,
				column: 4,
				character: 480
			},
			end: {
				line: 43,
				column: 17,
				character: 493
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "&:has(.unused)"',
			start: {
				line: 49,
				column: 4,
				character: 566
			},
			end: {
				line: 49,
				column: 18,
				character: 580
			}
		}
	]
});
