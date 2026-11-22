import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			end: {
				character: 61,
				column: 20,
				line: 4
			},
			message: 'Unused CSS selector ".unused[title="*/"]"',
			start: {
				character: 42,
				column: 1,
				line: 4
			}
		},
		{
			code: 'css_unused_selector',
			end: {
				character: 105,
				column: 20,
				line: 8
			},
			message: 'Unused CSS selector ".unused[title="*/"]"',
			start: {
				character: 86,
				column: 1,
				line: 8
			}
		},
		{
			code: 'css_unused_selector',
			end: {
				character: 160,
				column: 27,
				line: 12
			},
			message: 'Unused CSS selector ".unused[title="*/"]"',
			start: {
				character: 141,
				column: 8,
				line: 12
			}
		},
		{
			code: 'css_unused_selector',
			end: {
				character: 217,
				column: 27,
				line: 16
			},
			message: 'Unused CSS selector ".unused[title="*/"]"',
			start: {
				character: 198,
				column: 8,
				line: 16
			}
		},
		{
			code: 'css_unused_selector',
			end: {
				character: 247,
				column: 8,
				line: 20
			},
			message: 'Unused CSS selector ".unused"',
			start: {
				character: 240,
				column: 1,
				line: 20
			}
		},
		{
			code: 'css_unused_selector',
			end: {
				character: 301,
				column: 15,
				line: 24
			},
			message: 'Unused CSS selector ".unused"',
			start: {
				character: 294,
				column: 8,
				line: 24
			}
		},
		{
			code: 'css_unused_selector',
			end: {
				character: 365,
				column: 27,
				line: 28
			},
			message: 'Unused CSS selector ".unused"',
			start: {
				character: 358,
				column: 20,
				line: 28
			}
		}
	]
});
