import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "p :not(.foo)"',
			start: {
				line: 22,
				column: 1,
				character: 291
			},
			end: {
				line: 22,
				column: 13,
				character: 303
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "p :not(.unused)"',
			start: {
				line: 25,
				column: 1,
				character: 324
			},
			end: {
				line: 25,
				column: 16,
				character: 339
			}
		}
	]
});
