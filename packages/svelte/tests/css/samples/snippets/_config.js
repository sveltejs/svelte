import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "span div"',
			start: {
				line: 31,
				column: 1,
				character: 461
			},
			end: {
				line: 31,
				column: 9,
				character: 469
			}
		}
	]
});
