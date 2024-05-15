import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			end: {
				character: 239,
				column: 13,
				line: 20
			},
			message: 'Unused CSS selector ".unused"',
			start: {
				character: 232,
				column: 6,
				line: 20
			}
		},
		{
			code: 'css_unused_selector',
			end: {
				character: 302,
				column: 10,
				line: 27
			},
			message: 'Unused CSS selector ".unused"',
			start: {
				character: 295,
				column: 3,
				line: 27
			}
		},
		{
			code: 'css_unused_selector',
			end: {
				character: 328,
				column: 6,
				line: 30
			},
			message: 'Unused CSS selector ".c"',
			start: {
				character: 326,
				column: 4,
				line: 30
			}
		},
		{
			code: 'css_unused_selector',
			end: {
				character: 381,
				column: 10,
				line: 37
			},
			message: 'Unused CSS selector ".unused"',
			start: {
				character: 374,
				column: 3,
				line: 37
			}
		},
		{
			code: 'css_unused_selector',
			end: {
				character: 471,
				column: 7,
				line: 47
			},
			message: 'Unused CSS selector "& &"',
			start: {
				character: 468,
				column: 4,
				line: 47
			}
		},
		{
			code: 'css_unused_selector',
			end: {
				character: 634,
				column: 5,
				line: 66
			},
			message: 'Unused CSS selector "&.b"',
			start: {
				character: 631,
				column: 2,
				line: 66
			}
		},
		{
			code: 'css_unused_selector',
			end: {
				character: 666,
				column: 9,
				line: 70
			},
			message: 'Unused CSS selector ".unused"',
			start: {
				character: 659,
				column: 2,
				line: 70
			}
		}
	]
});
