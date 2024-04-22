import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css-unused-selector',
			end: {
				character: 38,
				column: 11,
				line: 6
			},
			message: 'Unused CSS selector "z"',
			start: {
				character: 37,
				column: 10,
				line: 6
			}
		}
	]
});
