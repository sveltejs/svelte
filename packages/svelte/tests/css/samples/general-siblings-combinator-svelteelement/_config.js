import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			end: {
				character: 627,
				column: 10,
				line: 32
			},
			message: 'Unused CSS selector ".x + .bar"',
			start: {
				character: 618,
				column: 1,
				line: 32
			}
		}
	]
});
