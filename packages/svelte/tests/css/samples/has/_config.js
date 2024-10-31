import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused:has(y)"',
			start: {
				line: 31,
				column: 1,
				character: 308
			},
			end: {
				line: 31,
				column: 15,
				character: 322
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused:has(:global(y))"',
			start: {
				line: 34,
				column: 1,
				character: 343
			},
			end: {
				line: 34,
				column: 24,
				character: 366
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "x:has(.unused)"',
			start: {
				line: 37,
				column: 1,
				character: 387
			},
			end: {
				line: 37,
				column: 15,
				character: 401
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "x:has(y):has(.unused)"',
			start: {
				line: 50,
				column: 1,
				character: 556
			},
			end: {
				line: 50,
				column: 22,
				character: 577
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused"',
			start: {
				line: 69,
				column: 2,
				character: 782
			},
			end: {
				line: 69,
				column: 9,
				character: 789
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused x:has(y)"',
			start: {
				line: 85,
				column: 1,
				character: 936
			},
			end: {
				line: 85,
				column: 17,
				character: 952
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused:has(.unused)"',
			start: {
				line: 88,
				column: 1,
				character: 973
			},
			end: {
				line: 88,
				column: 21,
				character: 993
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "x:has(> z)"',
			start: {
				line: 98,
				column: 1,
				character: 1093
			},
			end: {
				line: 98,
				column: 11,
				character: 1103
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "x:has(> d)"',
			start: {
				line: 101,
				column: 1,
				character: 1124
			},
			end: {
				line: 101,
				column: 11,
				character: 1134
			}
		}
	]
});
