import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			end: {
				character: 72,
				column: 3,
				line: 10
			},
			message: 'Unused CSS selector "h4"',
			start: {
				character: 70,
				column: 1,
				line: 10
			}
		}
	]
});
