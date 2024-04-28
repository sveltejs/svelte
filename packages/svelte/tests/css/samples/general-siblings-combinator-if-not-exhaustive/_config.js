import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".b ~ .c"',
			start: { character: 215, column: 1, line: 14 },
			end: { character: 222, column: 8, line: 14 }
		}
	]
});
