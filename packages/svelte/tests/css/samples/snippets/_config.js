import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "p .foo"',
			start: {
				line: 28,
				column: 1,
				character: 356
			},
			end: {
				line: 28,
				column: 7,
				character: 362
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "span div"',
			start: {
				line: 31,
				column: 1,
				character: 383
			},
			end: {
				line: 31,
				column: 9,
				character: 391
			}
		}
	]
});
