import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message:
				'Unused CSS selector "span /* comment */ b"\nhttps://svelte.dev/e/css_unused_selector',
			start: {
				line: 6,
				column: 8,
				character: 40
			},
			end: {
				line: 6,
				column: 28,
				character: 60
			}
		},
		{
			code: 'css_unused_selector',
			message:
				'Unused CSS selector "span /* comment */ b"\nhttps://svelte.dev/e/css_unused_selector',
			start: {
				line: 10,
				column: 1,
				character: 82
			},
			end: {
				line: 10,
				column: 21,
				character: 102
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "em"\nhttps://svelte.dev/e/css_unused_selector',
			start: {
				line: 14,
				column: 1,
				character: 133
			},
			end: {
				line: 14,
				column: 3,
				character: 135
			}
		},
		{
			code: 'css_unused_selector',
			message:
				'Unused CSS selector "span /* comment */ b"\nhttps://svelte.dev/e/css_unused_selector',
			start: {
				line: 14,
				column: 5,
				character: 137
			},
			end: {
				line: 14,
				column: 25,
				character: 157
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "i/* comment */.c"\nhttps://svelte.dev/e/css_unused_selector',
			start: {
				line: 14,
				column: 34,
				character: 166
			},
			end: {
				line: 14,
				column: 50,
				character: 182
			}
		}
	]
});
