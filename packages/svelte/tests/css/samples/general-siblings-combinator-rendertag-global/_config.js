import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			end: {
				character: 479,
				column: 19,
				line: 22
			},
			message: 'Unused CSS selector ":global(.x) + .bar"',
			start: {
				character: 461,
				column: 1,
				line: 22
			}
		}
	]
});
