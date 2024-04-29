import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".fooaa"',
			start: { line: 11, column: 2, character: 206 },
			end: { line: 11, column: 8, character: 212 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".foobb"',
			start: { line: 12, column: 2, character: 229 },
			end: { line: 12, column: 8, character: 235 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".foodd"',
			start: { line: 14, column: 2, character: 275 },
			end: { line: 14, column: 8, character: 281 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".bbbar"',
			start: { line: 20, column: 2, character: 401 },
			end: { line: 20, column: 8, character: 407 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".ccbar"',
			start: { line: 21, column: 2, character: 424 },
			end: { line: 21, column: 8, character: 430 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".ddbar"',
			start: { line: 22, column: 2, character: 447 },
			end: { line: 22, column: 8, character: 453 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".fooaabar"',
			start: { line: 23, column: 2, character: 470 },
			end: { line: 23, column: 11, character: 479 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".foobbbar"',
			start: { line: 24, column: 2, character: 496 },
			end: { line: 24, column: 11, character: 505 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".fooccbar"',
			start: { line: 25, column: 2, character: 522 },
			end: { line: 25, column: 11, character: 531 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused"',
			start: { line: 28, column: 2, character: 595 },
			end: { line: 28, column: 9, character: 602 }
		}
	]
});
