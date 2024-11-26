import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			end: {
				character: 127,
				column: 28,
				line: 10
			},
			message: 'Unused CSS selector "[data-active=\'true\'] > span"',
			start: {
				character: 100,
				column: 1,
				line: 10
			}
		}
	]
});
