import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused:has(y)"',
			start: {
				line: 33,
				column: 1,
				character: 330
			},
			end: {
				line: 33,
				column: 15,
				character: 344
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused:has(:global(y))"',
			start: {
				line: 36,
				column: 1,
				character: 365
			},
			end: {
				line: 36,
				column: 24,
				character: 388
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "x:has(.unused)"',
			start: {
				line: 39,
				column: 1,
				character: 409
			},
			end: {
				line: 39,
				column: 15,
				character: 423
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ":global(.foo):has(.unused)"',
			start: {
				line: 42,
				column: 1,
				character: 444
			},
			end: {
				line: 42,
				column: 27,
				character: 470
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "x:has(y):has(.unused)"',
			start: {
				line: 52,
				column: 1,
				character: 578
			},
			end: {
				line: 52,
				column: 22,
				character: 599
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused"',
			start: {
				line: 71,
				column: 2,
				character: 804
			},
			end: {
				line: 71,
				column: 9,
				character: 811
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused x:has(y)"',
			start: {
				line: 87,
				column: 1,
				character: 958
			},
			end: {
				line: 87,
				column: 17,
				character: 974
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused:has(.unused)"',
			start: {
				line: 90,
				column: 1,
				character: 995
			},
			end: {
				line: 90,
				column: 21,
				character: 1015
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "x:has(> z)"',
			start: {
				line: 100,
				column: 1,
				character: 1115
			},
			end: {
				line: 100,
				column: 11,
				character: 1125
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "x:has(> d)"',
			start: {
				line: 103,
				column: 1,
				character: 1146
			},
			end: {
				line: 103,
				column: 11,
				character: 1156
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "x:has(~ y)"',
			start: {
				line: 123,
				column: 1,
				character: 1348
			},
			end: {
				line: 123,
				column: 11,
				character: 1358
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "f:has(~ d)"',
			start: {
				line: 133,
				column: 1,
				character: 1446
			},
			end: {
				line: 133,
				column: 11,
				character: 1456
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ":has(.unused)"',
			start: {
				line: 141,
				column: 2,
				character: 1529
			},
			end: {
				line: 141,
				column: 15,
				character: 1542
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "&:has(.unused)"',
			start: {
				line: 147,
				column: 2,
				character: 1600
			},
			end: {
				line: 147,
				column: 16,
				character: 1614
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ":global(.foo):has(.unused)"',
			start: {
				line: 155,
				column: 1,
				character: 1684
			},
			end: {
				line: 155,
				column: 27,
				character: 1710
			}
		}
	]
});
