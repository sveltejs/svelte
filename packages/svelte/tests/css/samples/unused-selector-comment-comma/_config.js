import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused"',
			start: {
				line: 5,
				column: 1,
				character: 84
			},
			end: {
				line: 5,
				column: 8,
				character: 91
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused"',
			start: {
				line: 9,
				column: 8,
				character: 138
			},
			end: {
				line: 9,
				column: 15,
				character: 145
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused"',
			start: {
				line: 13,
				column: 1,
				character: 215
			},
			end: {
				line: 13,
				column: 8,
				character: 222
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".other-unused"',
			start: {
				line: 13,
				column: 21,
				character: 235
			},
			end: {
				line: 13,
				column: 34,
				character: 248
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused"',
			start: {
				line: 17,
				column: 8,
				character: 295
			},
			end: {
				line: 17,
				column: 15,
				character: 302
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".other-unused"',
			start: {
				line: 17,
				column: 28,
				character: 315
			},
			end: {
				line: 17,
				column: 41,
				character: 328
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused"',
			start: {
				line: 21,
				column: 5,
				character: 354
			},
			end: {
				line: 21,
				column: 12,
				character: 361
			}
		}
	]
});
