import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused"',
			start: {
				character: 79,
				column: 1,
				line: 7
			},
			end: {
				character: 86,
				column: 8,
				line: 7
			}
		}
	]
});
