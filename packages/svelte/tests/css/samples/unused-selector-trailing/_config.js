import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css-unused-selector',
			end: {
				character: 32,
				column: 3,
				line: 5
			},
			message: 'Unused CSS selector "h2"',
			start: {
				character: 30,
				column: 1,
				line: 5
			}
		}
	]
});
