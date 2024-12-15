import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "div + div"',
			start: {
				line: 19,
				column: 1,
				character: 185
			},
			end: {
				line: 19,
				column: 10,
				character: 194
			}
		}
	]
});
