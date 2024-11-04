import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ":global(.x) :not(p)"',
			start: {
				line: 14,
				column: 1,
				character: 197
			},
			end: {
				line: 14,
				column: 20,
				character: 216
			}
		}
	]
});
