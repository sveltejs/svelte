import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ":global(.foo) .bar"',
			start: { character: 9, column: 1, line: 2 },
			end: { character: 27, column: 19, line: 2 }
		}
	]
});
