import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused"',
			start: {
				character: 198,
				column: 2,
				line: 14
			},
			end: {
				character: 205,
				column: 9,
				line: 14
			}
		}
	]
});
