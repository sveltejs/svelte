import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused:has(&)"',
			start: {
				line: 10,
				column: 2,
				character: 105
			},
			end: {
				line: 10,
				column: 16,
				character: 119
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "&.unused"',
			start: {
				line: 23,
				column: 3,
				character: 223
			},
			end: {
				line: 23,
				column: 11,
				character: 231
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "&.unused"',
			start: {
				line: 37,
				column: 3,
				character: 344
			},
			end: {
				line: 37,
				column: 11,
				character: 352
			}
		}
	]
});
