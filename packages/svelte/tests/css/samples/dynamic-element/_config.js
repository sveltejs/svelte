import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused"',
			start: {
				character: 81,
				column: 1,
				line: 7
			},
			end: {
				character: 88,
				column: 8,
				line: 7
			}
		}
	]
});
