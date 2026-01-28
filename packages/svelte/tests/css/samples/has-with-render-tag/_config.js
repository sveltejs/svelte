import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "z:has(+ y)"',
			start: {
				line: 23,
				column: 1,
				character: 217
			},
			end: {
				line: 23,
				column: 11,
				character: 227
			}
		}
	]
});
