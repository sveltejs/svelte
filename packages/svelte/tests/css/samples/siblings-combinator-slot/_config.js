import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".b + .c"',
			start: { character: 137, column: 1, line: 11 },
			end: { character: 144, column: 8, line: 11 }
		}
	]
});
