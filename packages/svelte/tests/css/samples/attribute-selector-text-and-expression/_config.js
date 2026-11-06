import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			end: {
				character: 559,
				column: 32,
				line: 31
			},
			message: 'Unused CSS selector "button[aria-label=\'Close door\']"',
			start: {
				character: 528,
				column: 1,
				line: 31
			}
		},
		{
			code: 'css_unused_selector',
			end: {
				character: 600,
				column: 19,
				line: 35
			},
			message: 'Unused CSS selector "p[title=\'a and e\']"',
			start: {
				character: 582,
				column: 1,
				line: 35
			}
		},
		{
			code: 'css_unused_selector',
			end: {
				character: 646,
				column: 24,
				line: 39
			},
			message: 'Unused CSS selector "a[href=\'/docs/c/intro\']"',
			start: {
				character: 623,
				column: 1,
				line: 39
			}
		}
	]
});
