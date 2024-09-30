import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused"',
			start: {
				line: 19,
				column: 3,
				character: 204
			},
			end: {
				line: 19,
				column: 10,
				character: 211
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused :global"',
			start: {
				line: 34,
				column: 2,
				character: 332
			},
			end: {
				line: 34,
				column: 17,
				character: 347
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused :global(.z)"',
			start: {
				line: 40,
				column: 2,
				character: 386
			},
			end: {
				line: 40,
				column: 21,
				character: 405
			}
		}
	]
});
