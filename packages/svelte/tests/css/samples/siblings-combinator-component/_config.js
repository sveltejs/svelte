import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "n + m"',
			end: {
				character: 468,
				column: 6,
				line: 36
			},
			start: {
				character: 463,
				column: 1,
				line: 36
			}
		}
	]
});
