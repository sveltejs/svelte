import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "div > p"',
			start: {
				line: 8,
				column: 1,
				character: 74
			},
			end: {
				line: 8,
				column: 8,
				character: 81
			}
		}
	]
});
