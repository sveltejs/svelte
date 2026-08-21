import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".foob"',
			start: {
				line: 64,
				column: 1,
				character: 1574
			},
			end: {
				line: 64,
				column: 6,
				character: 1579
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "main > article > div > section > span"',
			start: {
				line: 84,
				column: 1,
				character: 2196
			},
			end: {
				line: 84,
				column: 38,
				character: 2233
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "nav:has(button).primary"',
			start: {
				line: 95,
				column: 1,
				character: 2560
			},
			end: {
				line: 95,
				column: 24,
				character: 2583
			}
		}
	]
});
