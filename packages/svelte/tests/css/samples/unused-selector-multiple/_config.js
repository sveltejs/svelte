import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'a11y_missing_content',
			message: '`<h1>` element should contain text',
			start: {
				line: 1,
				column: 0,
				character: 0
			},
			end: {
				line: 1,
				column: 9,
				character: 9
			}
		},
		{
			code: 'a11y_missing_content',
			message: '`<h4>` element should contain text',
			start: {
				line: 2,
				column: 0,
				character: 10
			},
			end: {
				line: 2,
				column: 9,
				character: 19
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "h2"',
			start: {
				line: 6,
				column: 5,
				character: 35
			},
			end: {
				line: 6,
				column: 7,
				character: 37
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "h3"',
			start: {
				line: 6,
				column: 9,
				character: 39
			},
			end: {
				line: 6,
				column: 11,
				character: 41
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "h2"',
			start: {
				line: 9,
				column: 5,
				character: 66
			},
			end: {
				line: 9,
				column: 7,
				character: 68
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "h2"',
			start: {
				line: 13,
				column: 5,
				character: 110
			},
			end: {
				line: 13,
				column: 7,
				character: 112
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "h3"',
			start: {
				line: 13,
				column: 9,
				character: 114
			},
			end: {
				line: 13,
				column: 11,
				character: 116
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "h2"',
			start: {
				line: 17,
				column: 5,
				character: 161
			},
			end: {
				line: 17,
				column: 7,
				character: 163
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "h3"',
			start: {
				line: 17,
				column: 9,
				character: 165
			},
			end: {
				line: 17,
				column: 11,
				character: 167
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "h5"',
			start: {
				line: 17,
				column: 17,
				character: 173
			},
			end: {
				line: 17,
				column: 19,
				character: 175
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "h6"',
			start: {
				line: 17,
				column: 21,
				character: 177
			},
			end: {
				line: 17,
				column: 23,
				character: 179
			}
		}
	]
});
