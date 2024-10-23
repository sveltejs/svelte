import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused:has(y)"',
			start: {
				line: 28,
				column: 1,
				character: 277
			},
			end: {
				line: 28,
				column: 15,
				character: 291
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused:has(:global(y))"',
			start: {
				line: 31,
				column: 1,
				character: 312
			},
			end: {
				line: 31,
				column: 24,
				character: 335
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "x:has(.unused)"',
			start: {
				line: 34,
				column: 1,
				character: 356
			},
			end: {
				line: 34,
				column: 15,
				character: 370
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "x:has(y):has(.unused)"',
			start: {
				line: 47,
				column: 1,
				character: 525
			},
			end: {
				line: 47,
				column: 22,
				character: 546
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused"',
			start: {
				line: 66,
				column: 2,
				character: 751
			},
			end: {
				line: 66,
				column: 9,
				character: 758
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused x:has(y)"',
			start: {
				line: 82,
				column: 1,
				character: 905
			},
			end: {
				line: 82,
				column: 17,
				character: 921
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused:has(.unused)"',
			start: {
				line: 85,
				column: 1,
				character: 942
			},
			end: {
				line: 85,
				column: 21,
				character: 962
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "x:has(> z)"',
			start: {
				line: 92,
				column: 1,
				character: 1029
			},
			end: {
				line: 92,
				column: 11,
				character: 1039
			}
		}
	]
});
