import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css-unused-selector',
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
