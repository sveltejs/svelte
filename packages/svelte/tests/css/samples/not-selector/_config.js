import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "span :not(.foo)"',
			start: {
				line: 26,
				column: 1,
				character: 276
			},
			end: {
				line: 26,
				column: 16,
				character: 291
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "span :not(.unused)"',
			start: {
				line: 29,
				column: 1,
				character: 312
			},
			end: {
				line: 29,
				column: 19,
				character: 330
			}
		}
	]
});
