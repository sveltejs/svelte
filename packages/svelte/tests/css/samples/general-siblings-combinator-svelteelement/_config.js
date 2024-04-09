import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css-unused-selector',
			end: {
				character: 496,
				column: 10,
				line: 26
			},
			message: 'Unused CSS selector ".x + .bar"',
			start: {
				character: 487,
				column: 1,
				line: 26
			}
		}
	]
});
