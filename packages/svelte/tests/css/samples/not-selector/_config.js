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
				line: 12,
				column: 1,
				character: 124
			},
			end: {
				line: 12,
				column: 24,
				character: 147
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "p :not(.foo)"',
			start: {
				line: 19,
				column: 1,
				character: 203
			},
			end: {
				line: 19,
				column: 13,
				character: 215
			}
		}
	]
});
