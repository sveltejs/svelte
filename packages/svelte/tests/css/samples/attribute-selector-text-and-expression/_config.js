import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			end: {
				character: 612,
				column: 32,
				line: 32
			},
			message: 'Unused CSS selector "button[aria-label=\'Close door\']"',
			start: {
				character: 581,
				column: 1,
				line: 32
			}
		},
		{
			code: 'css_unused_selector',
			end: {
				character: 653,
				column: 19,
				line: 36
			},
			message: 'Unused CSS selector "p[title=\'a and e\']"',
			start: {
				character: 635,
				column: 1,
				line: 36
			}
		},
		{
			code: 'css_unused_selector',
			end: {
				character: 699,
				column: 24,
				line: 40
			},
			message: 'Unused CSS selector "a[href=\'/docs/c/intro\']"',
			start: {
				character: 676,
				column: 1,
				line: 40
			}
		}
	]
});
