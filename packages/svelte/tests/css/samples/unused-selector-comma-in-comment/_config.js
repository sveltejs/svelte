import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			end: {
				character: 38,
				column: 8,
				line: 4
			},
			message: 'Unused CSS selector ".unused"',
			start: {
				character: 31,
				column: 1,
				line: 4
			}
		},
		{
			code: 'css_unused_selector',
			end: {
				character: 92,
				column: 15,
				line: 8
			},
			message: 'Unused CSS selector ".unused"',
			start: {
				character: 85,
				column: 8,
				line: 8
			}
		},
		{
			code: 'css_unused_selector',
			end: {
				character: 141,
				column: 8,
				line: 12
			},
			message: 'Unused CSS selector ".unused"',
			start: {
				character: 134,
				column: 1,
				line: 12
			}
		},
		{
			code: 'css_unused_selector',
			end: {
				character: 151,
				column: 18,
				line: 12
			},
			message: 'Unused CSS selector ".unused2"',
			start: {
				character: 143,
				column: 10,
				line: 12
			}
		},
		{
			code: 'css_unused_selector',
			end: {
				character: 199,
				column: 8,
				line: 16
			},
			message: 'Unused CSS selector ".unused"',
			start: {
				character: 192,
				column: 1,
				line: 16
			}
		}
	]
});
