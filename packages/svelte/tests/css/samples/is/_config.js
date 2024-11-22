import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused"',
			start: {
				line: 11,
				column: 10,
				character: 80
			},
			end: {
				line: 11,
				column: 17,
				character: 87
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "x :is(.unused)"',
			start: {
				line: 14,
				column: 1,
				character: 111
			},
			end: {
				line: 14,
				column: 15,
				character: 125
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ":global(.foo) :is(.unused)"',
			start: {
				line: 28,
				column: 1,
				character: 274
			},
			end: {
				line: 28,
				column: 27,
				character: 300
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ":global(.foo):is(.unused)"',
			start: {
				line: 34,
				column: 1,
				character: 363
			},
			end: {
				line: 34,
				column: 26,
				character: 388
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ":is(.unused)"',
			start: {
				line: 52,
				column: 2,
				character: 636
			},
			end: {
				line: 52,
				column: 14,
				character: 648
			}
		}
	]
});
