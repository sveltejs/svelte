import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ":global(.x) :not(.unused)"',
			start: {
				line: 17,
				column: 1,
				character: 289
			},
			end: {
				line: 17,
				column: 26,
				character: 314
			}
		}
	]
});
