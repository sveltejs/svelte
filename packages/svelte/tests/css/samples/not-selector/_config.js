import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ":not(p)"',
			start: {
				line: 11,
				column: 1,
				character: 125
			},
			end: {
				line: 11,
				column: 8,
				character: 132
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "p :not(.foo)"',
			start: {
				line: 22,
				column: 1,
				character: 235
			},
			end: {
				line: 22,
				column: 13,
				character: 247
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "p :not(.unused)"',
			start: {
				line: 25,
				column: 1,
				character: 268
			},
			end: {
				line: 25,
				column: 16,
				character: 283
			}
		}
	]
});
