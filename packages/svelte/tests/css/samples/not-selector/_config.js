import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ":not(.unused)"',
			start: {
				line: 8,
				column: 1,
				character: 89
			},
			end: {
				line: 8,
				column: 14,
				character: 102
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ":not(.foo):not(.unused)"',
			start: {
				line: 18,
				column: 1,
				character: 221
			},
			end: {
				line: 18,
				column: 24,
				character: 244
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "p :not(.foo)"',
			start: {
				line: 25,
				column: 1,
				character: 300
			},
			end: {
				line: 25,
				column: 13,
				character: 312
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ":global(.x) :not(.unused)"',
			start: {
				line: 34,
				column: 1,
				character: 469
			},
			end: {
				line: 34,
				column: 26,
				character: 494
			}
		}
	]
});
