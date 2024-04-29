import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ":host > span"',
			start: {
				character: 145,
				column: 1,
				line: 18
			},
			end: {
				character: 157,
				column: 13,
				line: 18
			}
		}
	]
});
