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
			message: 'Unused CSS selector ".unused"',
			start: {
				line: 14,
				column: 7,
				character: 117
			},
			end: {
				line: 14,
				column: 14,
				character: 124
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
			message: 'Unused CSS selector ".unused"',
			start: {
				line: 28,
				column: 19,
				character: 292
			},
			end: {
				line: 28,
				column: 26,
				character: 299
			}
		}
	]
});
