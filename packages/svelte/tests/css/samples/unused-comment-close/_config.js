import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused[title="*/"]"',
			start: {
				line: 4,
				column: 1,
				character: 51
			},
			end: {
				line: 4,
				column: 20,
				character: 70
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused[title=\'*/\']"',
			start: {
				line: 5,
				column: 8,
				character: 102
			},
			end: {
				line: 5,
				column: 27,
				character: 121
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused[title="*/"]"',
			start: {
				line: 6,
				column: 8,
				character: 154
			},
			end: {
				line: 6,
				column: 27,
				character: 173
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused[title="**/"]"',
			start: {
				line: 6,
				column: 29,
				character: 175
			},
			end: {
				line: 6,
				column: 49,
				character: 195
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused[title="*/"]"',
			start: {
				line: 7,
				column: 1,
				character: 213
			},
			end: {
				line: 7,
				column: 20,
				character: 232
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused[title="*/"]"',
			start: {
				line: 8,
				column: 1,
				character: 270
			},
			end: {
				line: 8,
				column: 20,
				character: 289
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused[title="\\*/"]"',
			start: {
				line: 9,
				column: 1,
				character: 307
			},
			end: {
				line: 9,
				column: 21,
				character: 327
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused[title="*/"]"',
			start: {
				line: 10,
				column: 10,
				character: 357
			},
			end: {
				line: 10,
				column: 29,
				character: 376
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused[title="*/"]"',
			start: {
				line: 11,
				column: 1,
				character: 402
			},
			end: {
				line: 11,
				column: 20,
				character: 421
			}
		}
	]
});
