import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".hover.unused"',
			start: { line: 15, column: 2, character: 261 },
			end: { line: 15, column: 15, character: 274 }
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused"',
			start: { line: 17, column: 2, character: 295 },
			end: { line: 17, column: 9, character: 302 }
		}
	]
});
