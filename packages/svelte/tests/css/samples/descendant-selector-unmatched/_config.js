import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css-unused-selector',
			end: {
				character: 33,
				column: 6,
				line: 6
			},
			message: 'Unused CSS selector "x y z"',
			start: {
				character: 28,
				column: 1,
				line: 6
			}
		}
	]
});
