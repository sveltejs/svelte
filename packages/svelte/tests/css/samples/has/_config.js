import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused:has(y)"',
			start: {
				character: 269,
				column: 1,
				line: 27
			},
			end: {
				character: 283,
				column: 15,
				line: 27
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused:has(:global(y))"',
			start: {
				character: 304,
				column: 1,
				line: 30
			},
			end: {
				character: 327,
				column: 24,
				line: 30
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "x:has(.unused)"',
			start: {
				character: 348,
				column: 1,
				line: 33
			},
			end: {
				character: 362,
				column: 15,
				line: 33
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "x:has(y):has(.unused)"',
			start: {
				character: 517,
				column: 1,
				line: 46
			},
			end: {
				character: 538,
				column: 22,
				line: 46
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused"',
			start: {
				character: 743,
				column: 2,
				line: 65
			},
			end: {
				character: 750,
				column: 9,
				line: 65
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused x:has(y)"',
			start: {
				character: 897,
				column: 1,
				line: 81
			},
			end: {
				character: 913,
				column: 17,
				line: 81
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "x:has(> z)"',
			start: {
				line: 88,
				column: 1,
				character: 968
			},
			end: {
				line: 88,
				column: 11,
				character: 978
			}
		}
	]
});
