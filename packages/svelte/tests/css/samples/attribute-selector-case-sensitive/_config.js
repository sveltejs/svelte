import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			end: {
				character: 44,
				column: 14,
				line: 4
			},
			message: 'Unused CSS selector "p[type=\'B\' s]"',
			start: {
				character: 31,
				column: 1,
				line: 4
			}
		}
	]
});
