import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused:has(y)"',
			start: {
				line: 41,
				column: 1,
				character: 378
			},
			end: {
				line: 41,
				column: 15,
				character: 392
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused:has(:global(y))"',
			start: {
				line: 44,
				column: 1,
				character: 413
			},
			end: {
				line: 44,
				column: 24,
				character: 436
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "x:has(.unused)"',
			start: {
				line: 47,
				column: 1,
				character: 457
			},
			end: {
				line: 47,
				column: 15,
				character: 471
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ":global(.foo):has(.unused)"',
			start: {
				line: 50,
				column: 1,
				character: 492
			},
			end: {
				line: 50,
				column: 27,
				character: 518
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "x:has(y):has(.unused)"',
			start: {
				line: 60,
				column: 1,
				character: 626
			},
			end: {
				line: 60,
				column: 22,
				character: 647
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused"',
			start: {
				line: 79,
				column: 2,
				character: 852
			},
			end: {
				line: 79,
				column: 9,
				character: 859
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused x:has(y)"',
			start: {
				line: 95,
				column: 1,
				character: 1006
			},
			end: {
				line: 95,
				column: 17,
				character: 1022
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused:has(.unused)"',
			start: {
				line: 98,
				column: 1,
				character: 1043
			},
			end: {
				line: 98,
				column: 21,
				character: 1063
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "x:has(> z)"',
			start: {
				line: 108,
				column: 1,
				character: 1163
			},
			end: {
				line: 108,
				column: 11,
				character: 1173
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "x:has(> d)"',
			start: {
				line: 111,
				column: 1,
				character: 1194
			},
			end: {
				line: 111,
				column: 11,
				character: 1204
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "x:has(~ y)"',
			start: {
				line: 131,
				column: 1,
				character: 1396
			},
			end: {
				line: 131,
				column: 11,
				character: 1406
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "f:has(~ d)"',
			start: {
				line: 141,
				column: 1,
				character: 1494
			},
			end: {
				line: 141,
				column: 11,
				character: 1504
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ":has(.unused)"',
			start: {
				line: 149,
				column: 2,
				character: 1577
			},
			end: {
				line: 149,
				column: 15,
				character: 1590
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "&:has(.unused)"',
			start: {
				line: 155,
				column: 2,
				character: 1648
			},
			end: {
				line: 155,
				column: 16,
				character: 1662
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ":global(.foo):has(.unused)"',
			start: {
				line: 163,
				column: 1,
				character: 1732
			},
			end: {
				line: 163,
				column: 27,
				character: 1758
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "h:has(> h > i)"',
			start: {
				line: 170,
				column: 1,
				character: 1817
			},
			end: {
				line: 170,
				column: 15,
				character: 1831
			}
		}
	]
});
