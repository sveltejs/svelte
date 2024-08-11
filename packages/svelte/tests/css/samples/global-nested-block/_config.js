import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused :global"',
			start: {
				line: 25,
				column: 2,
				character: 229
			},
			end: {
				line: 25,
				column: 17,
				character: 244
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused :global(.z)"',
			start: {
				line: 31,
				column: 2,
				character: 283
			},
			end: {
				line: 31,
				column: 21,
				character: 302
			}
		}
	]
});
